'use client'

import { useState } from 'react'
import { TruckIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useCart } from './CartContext'

// 1. Tipagem para o frete
interface ShippingResult {
  Nome: string;
  Valor: string;
  PrazoEntrega: number;
  Codigo: string;
}

// 2. Tipagem para os dados do produto que o componente vai receber
interface ProductProps {
  id: string | number;
  price: number;
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
}

// 3. Agora o componente aceita o "product" como propriedade
export default function ShippingCalculator({ product }: { product?: ProductProps }) {
  const [cep, setCep] = useState('')
  const [results, setResults] = useState<ShippingResult[]>([])
  const [loading, setLoading] = useState(false)
  
  // Nota: Geralmente não setamos o frete global do carrinho a partir da página do produto, 
  // pois o cliente ainda não adicionou na bolsa, mas mantive sua lógica original.
  const { setShippingCost } = useCart() 

  const handleCalculate = async () => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length < 8) return

    setLoading(true)
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 📦 A MÁGICA AQUI: Mandando o produto atual para a API cubar o tamanho exato!
        body: JSON.stringify({ 
          cepDestino: cleanCep,
          items: product ? [{
            id: product.id,
            price: product.price,
            weight: product.weight,
            width: product.width,
            height: product.height,
            length: product.length,
            quantity: 1
          }] : [] 
        }),
      })
      
      const data = await res.json()
      
      if (res.ok && Array.isArray(data) && data.length > 0) {
        setResults(data)
        const defaultOption = data[0]
        const valorNumerico = parseFloat(defaultOption.Valor.replace(',', '.'))
        
        setShippingCost(valorNumerico)
      } else {
        // Se cair no nosso fallback ou der erro
        setResults(Array.isArray(data) ? data : [])
        if (data.error) alert(data.error)
      }
    } catch (err) {
      console.error("Erro ao calcular frete:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10 pt-10 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <TruckIcon className="h-4 w-4 text-gray-400" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Calcular Entrega_</span>
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="00000-000"
          value={cep}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 8)
            // Máscara visual simples enquanto digita
            setCep(val.length > 5 ? `${val.slice(0, 5)}-${val.slice(5)}` : val)
          }}
          className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:border-gray-900 flex-1 transition-all"
        />
        <button 
          onClick={handleCalculate}
          disabled={loading || cep.replace(/\D/g, '').length < 8}
          className="bg-gray-900 text-white px-6 rounded-lg hover:bg-black transition-all disabled:opacity-30 flex items-center justify-center"
        >
          {loading ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRightIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
          {results.map((res, idx) => (
            <div 
              key={idx} 
              className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 hover:border-gray-900 transition-colors cursor-default"
            >
              <div>
                <p className="text-[10px] font-black uppercase text-gray-900 tracking-widest">{res.Nome}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 italic">Até {res.PrazoEntrega} dias úteis_</p>
              </div>
              <p className="text-sm font-black italic text-gray-900">R$ {res.Valor}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Ícone de loading extraído para não dar erro de import
function ArrowPathIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  )
}