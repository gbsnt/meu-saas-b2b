'use client'

import { useState } from 'react'
import { useCart } from '../../components/CartContext'
import Link from 'next/link'
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  ArrowPathIcon, 
  CheckCircleIcon,
  ShoppingBagIcon 
} from '@heroicons/react/24/outline'

export default function CheckoutPage() {
  const { cart, cartTotal, shippingCost, setShippingCost, finalTotal } = useCart()
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [cepInput, setCepInput] = useState("")

  const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '').slice(0, 8)
    
    // Máscara 00000-000
    const maskedValue = rawValue.length <= 5 ? rawValue : `${rawValue.slice(0, 5)}-${rawValue.slice(5, 8)}`
    setCepInput(maskedValue)
    
    if (rawValue.length === 8) {
      setLoadingShipping(true)
      try {
        const res = await fetch('/api/shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cepDestino: rawValue }),
        })

        const data = await res.json()

        // Se a API retornar sucesso ou o nosso fallback (sempre será um array)
        if (Array.isArray(data) && data.length > 0) {
          setShippingOptions(data)
          // Seleciona automaticamente a primeira opção para agilizar
          const firstOption = data[0]
          const valorNum = parseFloat(firstOption.Valor.replace(',', '.'))
          setShippingCost(valorNum)
          setSelectedOption(firstOption.Nome)
        }
      } catch (err) {
        console.error("Erro na requisição:", err)
        // Contingência total: caso a API caia, injeta um frete padrão manualmente
        const fallback = [{ Nome: 'ENVIO PADRÃO_', Valor: '25,00', PrazoEntrega: 7, Codigo: 'safe-fallback' }]
        setShippingOptions(fallback)
        setShippingCost(25.00)
        setSelectedOption('ENVIO PADRÃO_')
      } finally {
        setLoadingShipping(false)
      }
    } else {
      // Limpa seleções se o CEP estiver incompleto
      setShippingOptions([])
      setShippingCost(null)
      setSelectedOption(null)
    }
  }

  const selectShipping = (option: any) => {
    const valorNum = parseFloat(option.Valor.replace(',', '.'))
    setShippingCost(valorNum)
    setSelectedOption(option.Nome)
  }

  if (cart.length === 0) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <ShoppingBagIcon className="h-12 w-12 text-gray-200 mb-4" />
      <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-6 text-gray-900">Sua bolsa está vazia_</h1>
      <Link href="/#shop" className="text-[10px] font-black uppercase tracking-[0.3em] px-10 py-4 bg-gray-900 text-white hover:invert transition-all">
        Voltar para a loja
      </Link>
    </div>
  )

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-16 border-b border-gray-100 pb-8">
          <Link href="/" className="font-bold text-2xl uppercase italic tracking-tighter text-gray-900">STUDIO_</Link>
          <div className="flex items-center text-gray-400 gap-2">
            <LockClosedIcon className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Ambiente Seguro</span>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-20">
          
          {/* COLUNA 1: DADOS */}
          <section>
            <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
              
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-8 border-l-4 border-gray-900 pl-4">
                  01. Entrega_
                </h2>
                <div className="space-y-6">
                  <input type="email" required className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-gray-900 text-sm" placeholder="E-MAIL" />

                  <div className="grid grid-cols-2 gap-8">
                    <input type="text" placeholder="NOME" className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-gray-900 text-sm" />
                    <input type="text" placeholder="SOBRENOME" className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-gray-900 text-sm" />
                  </div>

                  <input type="text" placeholder="ENDEREÇO COMPLETO" className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-gray-900 text-sm" />

                  <div className="grid grid-cols-3 gap-8">
                    <input type="text" placeholder="CIDADE" className="col-span-2 border-b-2 border-gray-100 py-3 outline-none focus:border-gray-900 text-sm" />
                    <div className="relative">
                      <input 
                        type="text" 
                        value={cepInput}
                        onChange={handleZipCodeChange}
                        placeholder="CEP"
                        className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-gray-900 text-sm font-black" 
                      />
                      {loadingShipping && <ArrowPathIcon className="h-4 w-4 absolute right-0 bottom-3 animate-spin text-gray-900" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* SELEÇÃO DE FRETE */}
              {shippingOptions.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                   <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6 border-l-4 border-gray-900 pl-4">
                    Método de Envio_
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {shippingOptions.map((option) => (
                      <div 
                        key={option.Nome}
                        onClick={() => selectShipping(option)}
                        className={`p-5 border-2 cursor-pointer transition-all flex flex-col justify-between h-28 ${
                          selectedOption === option.Nome 
                          ? 'border-gray-900 bg-gray-900 text-white shadow-xl' 
                          : 'border-gray-100 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start text-[9px] font-black uppercase tracking-widest">
                          <span className={selectedOption === option.Nome ? 'text-gray-400' : 'text-gray-900'}>
                            {option.Nome}
                          </span>
                          {selectedOption === option.Nome && <CheckCircleIcon className="h-5 w-5 text-white" />}
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-[8px] font-bold uppercase opacity-60">
                            {option.PrazoEntrega} DIAS
                          </span>
                          <span className={`text-lg font-black italic ${selectedOption === option.Nome ? 'text-white' : 'text-gray-900'}`}>
                            R$ {option.Valor}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PAGAMENTO */}
              <div className={!selectedOption ? 'opacity-20 pointer-events-none' : ''}>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-8 border-l-4 border-gray-900 pl-4">
                  02. Pagamento_
                </h2>
                <div className="p-6 border-2 border-gray-900 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full border-4 border-gray-900 mr-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Checkout Seguro (Cartão / PIX)</span>
                  </div>
                  <ShieldCheckIcon className="h-6 w-6 text-gray-900" />
                </div>
              </div>

              <button 
                disabled={loadingShipping || !selectedOption}
                className="w-full bg-gray-900 py-8 text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-10 shadow-2xl"
              >
                {loadingShipping ? 'Processando_' : `Finalizar Pedido R$ ${finalTotal.toFixed(2)}`}
              </button>
            </form>
          </section>

          {/* COLUNA 2: RESUMO */}
          <section className="mt-16 lg:mt-0">
            <div className="lg:sticky lg:top-10 bg-gray-50 p-10 border border-gray-100">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10">Bolsa_</h2>
              
              <ul className="divide-y divide-gray-200 mb-10">
                {cart.map((item) => (
                  <li key={item.id} className="flex py-6 first:pt-0">
                    <img src={item.image_url} className="h-20 w-20 object-cover border border-gray-200 bg-white" alt={item.name} />
                    <div className="ml-6 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between text-[11px] font-black uppercase italic text-gray-900">
                        <span>{item.name} <span className="text-gray-400 not-italic ml-2">x{item.quantity}</span></span>
                        <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-4 border-t-2 border-gray-900 pt-10">
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-gray-900">R$ {cartTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                  <span>Envio {selectedOption && <span className="text-gray-900">({selectedOption})</span>}</span>
                  <span className="text-gray-900 font-black italic">
                    {shippingCost === null ? "Calculando_" : `R$ ${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-3xl font-black uppercase italic text-gray-900 pt-6 border-t border-gray-200">
                  <span>Total</span>
                  <span>R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}