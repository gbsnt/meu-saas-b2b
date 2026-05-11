'use client'

import { useState } from 'react'
import { TruckIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useCart } from './CartContext'

export default function ShippingCalculator() {
  const [cep, setCep] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { setShippingCost } = useCart()

  const handleCalculate = async () => {
    if (cep.length < 8) return
    setLoading(true)
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cepDestino: cep }),
      })
      
      const data = await res.json()
      
      if (Array.isArray(data) && data.length > 0) {
        setResults(data)
        // Salva o valor do PAC (segundo item) no checkout como padrão
        const valorNumerico = parseFloat(data[1].Valor.replace(',', '.'))
        setShippingCost(valorNumerico)
      } else {
        alert(data.error || "Erro ao calcular")
      }
    } catch (err) {
      console.error(err)
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
          onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
          className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:border-gray-900 flex-1 transition-all"
        />
        <button 
          onClick={handleCalculate}
          disabled={loading || cep.length < 8}
          className="bg-gray-900 text-white px-6 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-30"
        >
          {loading ? '...' : <ArrowRightIcon className="h-4 w-4" />}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-6 space-y-3">
          {results.map((res, idx) => (
            <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-900">{res.Nome}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Até {res.PrazoEntrega} dias</p>
              </div>
              <p className="text-sm font-black italic text-gray-900">R$ {res.Valor}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}