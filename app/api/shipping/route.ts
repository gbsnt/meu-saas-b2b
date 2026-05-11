import { NextResponse } from 'next/server'

// 1. CONFIGURAÇÃO: Defina aqui quais transportadoras você quer exibir
const ALLOWED_COMPANIES = ['Correios', 'Jadlog', 'Loggi'];

export async function POST(req: Request) {
  try {
    const { cepDestino } = await req.json()
    const cleanDestino = cepDestino.replace(/\D/g, '')
    
    // CEP de Origem (Validado nos logs anteriores)
    const cleanOrigem = '96010280' 

    const response = await fetch('https://www.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
        'User-Agent': 'STUDIO_PROD_APP'
      },
      body: JSON.stringify({
        from: { postal_code: cleanOrigem }, 
        to: { postal_code: cleanDestino },
        package: { weight: 0.5, width: 15, height: 15, length: 15 }
      })
    })

    const data = await response.json()

    // 2. SE A RESPOSTA FOR SUCESSO (ARRAY DE SERVIÇOS)
    if (response.ok && Array.isArray(data)) {
      const formattedData = data
        .filter((service: any) => {
          const isAllowed = ALLOWED_COMPANIES.includes(service.company.name);
          const hasPrice = !service.error && service.price;
          // Bloqueia serviços de "Mini Envios" que costumam ter regras chatas de tamanho
          const isNotMini = !service.name.toLowerCase().includes('mini');
          
          return isAllowed && hasPrice && isNotMini;
        })
        .map((service: any) => {
          // Limpeza dos nomes (Ex: Jadlog .Package vira Jadlog Package)
          let nomeLimpo = service.name.replace('.', '');
          if (nomeLimpo === 'SEDEX') nomeLimpo = 'Express';
          if (nomeLimpo === 'PAC') nomeLimpo = 'Standard';

          return {
            Nome: `${service.company.name} ${nomeLimpo}_`.toUpperCase(),
            Valor: service.price.replace('.', ','),
            PrazoEntrega: service.delivery_time,
            Codigo: service.id
          }
        })

      // Se após o filtro ainda tivermos opções, retornamos elas
      if (formattedData.length > 0) {
        return NextResponse.json(formattedData)
      }
    }

    // 3. CONTINGÊNCIA: Se o CEP for geral ou a API falhar, libera o Frete Único
    // Isso garante que o botão "Finalizar Pedido" nunca fique travado.
    return NextResponse.json([
      {
        Nome: "ENVIO ECONÔMICO_",
        Valor: "22,90", 
        PrazoEntrega: 10,
        Codigo: "contingencia-safe"
      }
    ])

  } catch (error: any) {
    console.error("Erro na Rota Shipping:", error.message)
    return NextResponse.json([
      { Nome: "FRETE FIXO_", Valor: "25,00", PrazoEntrega: 7, Codigo: "critical-error" }
    ])
  }
}