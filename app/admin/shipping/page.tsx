'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  TruckIcon, 
  MapPinIcon,
  CheckCircleIcon, 
  ArrowPathIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ShippingConfig {
  id: string
  slug: string
  name: string
  enabled: boolean
}

export default function ShippingAdmin() {
  const [configs, setConfigs] = useState<ShippingConfig[]>([])
  const [originCep, setOriginCep] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // 📦 NOVO ESTADO: Controle da exibição na página do produto
  const [showProductShipping, setShowProductShipping] = useState(true)
  const [updatingFront, setUpdatingFront] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    // 1. Busca as transportadoras
    const { data: shipData } = await supabase.from('shipping_configs').select('*').order('name')
    if (shipData) setConfigs(shipData)

    // 2. Busca o CEP de Origem
    const { data: setts } = await supabase.from('store_settings').select('value').eq('key', 'origin_cep').single()
    if (setts) setOriginCep(setts.value)
    
    // 3. Busca a configuração de exibição no front
    const { data: showShipData } = await supabase.from('store_settings').select('value').eq('key', 'show_shipping_product_page').single()
    if (showShipData) {
      setShowProductShipping(showShipData.value !== 'false') // Se for 'false' string, desativa.
    }

    setLoading(false)
  }

  const saveCep = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key: 'origin_cep', value: originCep.replace(/\D/g, '') })
    
    if (error) alert("Erro ao salvar CEP_")
    else alert("Configuração de origem atualizada_")
    setSaving(false)
  }

  const toggleShipping = async (id: string, current: boolean) => {
    setUpdatingId(id)
    const { error } = await supabase.from('shipping_configs').update({ enabled: !current }).eq('id', id)
    if (!error) {
      setConfigs(prev => prev.map(c => c.id === id ? { ...c, enabled: !current } : c))
    }
    setUpdatingId(null)
  }

  // 🚀 NOVA FUNÇÃO: Liga/Desliga o frete na página do produto
  const toggleFrontDisplay = async () => {
    setUpdatingFront(true)
    const newValue = !showProductShipping // Inverte o valor atual
    
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key: 'show_shipping_product_page', value: String(newValue) })
    
    if (!error) {
      setShowProductShipping(newValue)
    } else {
      alert("Erro ao atualizar exibição_")
    }
    setUpdatingFront(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* NAVEGAÇÃO INTERNA */}
      <div className="border-b border-gray-100 p-6 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all">
          <ArrowLeftIcon className="h-3 w-3" /> Voltar ao Painel
        </Link>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">Configurações / Frete_</span>
      </div>

      <div className="max-w-4xl mx-auto p-8 md:p-16">
        <header className="mb-16">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-gray-900">Logística_</h1>
          <p className="text-xs font-bold text-gray-400 uppercase mt-2 tracking-widest">Controle de distribuição e pontos de saída.</p>
        </header>

        {/* SEÇÃO 01: ORIGEM */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-10 bg-gray-900"></div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">01. Ponto de Expedição_</h2>
          </div>
          
          <div className="bg-gray-50 p-10 border border-gray-100 flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1">
              <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">CEP de Origem (Somente números)</label>
              <div className="relative">
                <MapPinIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" 
                  value={originCep}
                  onChange={(e) => setOriginCep(e.target.value)}
                  className="w-full bg-white border border-gray-200 pl-12 pr-4 py-4 text-sm font-bold outline-none focus:border-gray-900 transition-all"
                  placeholder="00000000"
                />
              </div>
            </div>
            <button 
              onClick={saveCep}
              disabled={saving}
              className="bg-gray-900 text-white px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-20"
            >
              {saving ? 'Sincronizando_' : 'Atualizar_'}
            </button>
          </div>
        </section>

        {/* SEÇÃO 02: TRANSPORTADORAS */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-10 bg-gray-900"></div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">02. Parceiros Logísticos_</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configs.map(config => (
              <div 
                key={config.id}
                className={`p-8 border-2 transition-all flex items-center justify-between ${
                  config.enabled ? 'border-gray-900 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">{config.name}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">{config.enabled ? 'Operacional' : 'Desativado'}</p>
                </div>
                <button 
                  onClick={() => toggleShipping(config.id, config.enabled)}
                  disabled={updatingId === config.id}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                    config.enabled ? 'bg-red-50 text-red-600' : 'bg-gray-900 text-white'
                  }`}
                >
                  {updatingId === config.id ? '...' : config.enabled ? 'Desligar_' : 'Ligar_'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SEÇÃO 03: EXIBIÇÃO NO FRONT */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-10 bg-gray-900"></div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">03. Exibição no Front_</h2>
          </div>

          <div className={`p-8 border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            showProductShipping ? 'border-gray-900 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : 'border-gray-100 bg-gray-50'
          }`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Calculadora na Página do Produto</p>
              <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">
                {showProductShipping ? 'Visível para o cliente' : 'Oculto (Apenas Checkout)'}
              </p>
            </div>
            <button 
              onClick={toggleFrontDisplay}
              disabled={updatingFront}
              className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest transition-all w-full sm:w-auto ${
                showProductShipping ? 'bg-red-50 text-red-600' : 'bg-gray-900 text-white'
              }`}
            >
              {updatingFront ? 'Sincronizando_' : showProductShipping ? 'Ocultar_' : 'Exibir_'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}