import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // 🛡️ Segurança 1: Verifica se o CEP veio no body
    const rawCep = body.cepDestino || body.cep
    
    if (!rawCep) {
      console.error("❌ ERRO: CEP não fornecido")
      return NextResponse.json({ error: "CEP é obrigatório" }, { status: 400 })
    }

    const cleanDestino = String(rawCep).replace(/\D/g, '')

    if (cleanDestino.length !== 8) {
      return NextResponse.json({ error: "CEP inválido" }, { status: 400 })
    }

    // 📦 NOVO: Recebendo os itens reais do carrinho
    const cartItems = body.items || []

    // Mapeia os produtos do carrinho para o formato do Melhor Envio
    const productsToShip = cartItems.length > 0 
      ? cartItems.map((item: any) => ({
          id: item.id || 'item',
          width: item.width || 20,     // Usa a medida real ou fallback de 20cm
          height: item.height || 15,   // Usa a medida real ou fallback de 15cm
          length: item.length || 25,   // Usa a medida real ou fallback de 25cm
          weight: item.weight || 0.5,  // Usa o peso real ou fallback de 500g
          insurance_value: item.price || 50, // Seguro = valor do produto
          quantity: item.quantity || 1,
        }))
      : [
          // Fallback caso o frontend esqueça de enviar os itens
          {
            id: 'default',
            width: 20,
            height: 15,
            length: 25,
            weight: 0.5,
            insurance_value: 50,
            quantity: 1,
          }
        ]

    // 1. Tentar buscar transportadoras e CEP de Origem no Supabase
    let allowedCompanies = ['Jadlog', 'Correios', 'Loggi'] // Fallback padrão
    let originCep = String(process.env.MELHOR_ENVIO_ORIGIN_POSTAL_CODE || '01310100').replace(/\D/g, '')
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Busca configurações de transportadoras
        const { data: configs } = await supabase
          .from('shipping_configs')
          .select('slug')
          .eq('enabled', true)

        // Se o Supabase responder (mesmo que seja um array vazio porque você desligou tudo)
        if (configs) {
          allowedCompanies = configs.map((c: { slug: string }) => c.slug)
        }

        // Busca o CEP de origem cadastrado no Admin
        const { data: settings } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'origin_cep')
          .single()

        if (settings && settings.value) {
          originCep = String(settings.value).replace(/\D/g, '')
        }
      }
    } catch (e) {
      console.warn("⚠️ Falha ao ler o Supabase. Usando fretes e CEP padrão do .env")
    }

    // Função de Fallback Inteligente
    const makeFallback = () => {
      // Se não tem nenhuma transportadora ativa no painel
      if (allowedCompanies.length === 0) {
        return [{
          Nome: 'ENVIO PADRÃO (Contingência)_',
          Valor: '25,00',
          PrazoEntrega: 7,
          Codigo: 'fallback-geral',
        }]
      }
      
      // Se a(s) transportadora(s) selecionada(s) não atende(m) a rota
      return allowedCompanies.map((slug) => ({
        Nome: `${slug} — Rota Indisponível`,
        Valor: '25,00',
        PrazoEntrega: 7,
        Codigo: `fallback-${slug}`,
      }))
    }

    // 2. Chamada ao Melhor Envio
    const meBase =
      process.env.MELHOR_ENVIO_USE_SANDBOX === 'true'
        ? 'https://sandbox.melhorenvio.com.br'
        : 'https://www.melhorenvio.com.br'

    const token = process.env.MELHOR_ENVIO_TOKEN

    if (originCep.length !== 8 || !token) {
      console.warn('⚠️ Token ou CEP de origem inválidos; usando fallback.')
      return NextResponse.json(makeFallback())
    }

    const meResponse = await fetch(`${meBase}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': process.env.MELHOR_ENVIO_USER_AGENT || 'meu-saas-b2b (contato@exemplo.com)',
      },
      body: JSON.stringify({
        from: { postal_code: originCep },
        to: { postal_code: cleanDestino },
        products: productsToShip, // 🚀 AQUI ELE INJETA O CARRINHO REAL!
        options: {
          receipt: false,
          own_hand: false,
        },
      }),
    })

    if (!meResponse.ok) {
      const errText = await meResponse.text()
      console.error('❌ Erro Melhor Envio:', meResponse.status, errText)
      return NextResponse.json(makeFallback())
    }

    const raw: unknown = await meResponse.json()
    if (!Array.isArray(raw)) {
      console.error('❌ Resposta inesperada do Melhor Envio:', raw)
      return NextResponse.json(makeFallback())
    }

    type MeQuote = {
      id: number
      name: string
      custom_price?: string
      price?: string
      custom_delivery_time?: number
      delivery_time?: number
      company?: { name: string }
    }

    const normalizedAllowed = allowedCompanies.map((s) => s.toLowerCase())

    const mapped = (raw as MeQuote[])
    .filter((q) => {
      // 1. Verifica se a transportadora está ativada no painel
      const isAllowed = q.company?.name && normalizedAllowed.includes(q.company.name.toLowerCase())
      if (!isAllowed) return false

      // 2. Verifica o preço para evitar fretes "zerados" ou com erro
      const priceStr = q.custom_price ?? q.price ?? '0'
      const priceNum = parseFloat(String(priceStr).replace(',', '.'))
      
      // 3. Só deixa passar se o frete for maior que R$ 0,00 e não tiver flag de erro do Melhor Envio
      const hasError = (q as any).error !== undefined
      
      return priceNum > 0 && !hasError
    })
    .map((q) => {
      const priceStr = q.custom_price ?? q.price ?? '0'
      const priceNum = parseFloat(String(priceStr).replace(',', '.'))
      const valor = priceNum.toFixed(2).replace('.', ',')
      const prazo = q.custom_delivery_time ?? q.delivery_time ?? 0
      
      return {
        Nome: `${q.company!.name} — ${q.name}`,
        Valor: valor,
        PrazoEntrega: prazo,
        Codigo: String(q.id),
      }
    })

    // Se as transportadoras selecionadas não entregarem no CEP de destino (ou se nenhuma estiver ativa)
    if (mapped.length === 0) {
      return NextResponse.json(makeFallback())
    }

    return NextResponse.json(mapped)
    
  } catch (e: any) {
    console.error("🔥 ERRO FATAL NA API:", e.message)
    return NextResponse.json(
      [{
        Nome: 'ENVIO PADRÃO (Contingência)_',
        Valor: '25,00',
        PrazoEntrega: 7,
        Codigo: 'fallback-fatal'
      }],
      { status: 200 } // Retornar 200 pro front-end não quebrar o parse do JSON
    )
  }
}