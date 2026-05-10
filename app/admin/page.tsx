'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

// Força o Next.js a sempre gerar a página no servidor, evitando os erros de cache
export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState(0)

  // Busca no Supabase quantos produtos você tem cadastrados
  useEffect(() => {
    async function loadStats() {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
      
      setProductCount(count || 0)
    }
    loadStats()
  }, [])

  const stats = [
    { name: 'Receita Total', value: 'R$ 0,00', change: '+0%', changeType: 'positive' },
    { name: 'Pedidos Pendentes', value: '0', change: 'Hoje', changeType: 'neutral' },
    { name: 'Produtos Ativos', value: productCount.toString(), change: 'No Banco de Dados', changeType: 'neutral' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">
          Dashboard_
        </h1>
        <p className="mt-2 text-sm text-gray-500 font-medium">
          Visão geral da sua operação B2B.
        </p>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <dt className="truncate text-xs font-bold uppercase tracking-widest text-gray-400">
              {stat.name}
            </dt>
            <dd className="mt-4 flex items-baseline gap-4">
              <span className="text-4xl font-black tracking-tight text-gray-900">
                {stat.value}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${stat.changeType === 'positive' ? 'text-green-500' : 'text-gray-400'}`}>
                {stat.change}
              </span>
            </dd>
          </div>
        ))}
      </div>

      {/* ÁREA FUTURA PARA GRÁFICOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-96 flex flex-col items-center justify-center border-dashed border-2">
        <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Módulo de Relatórios em breve_</p>
      </div>
    </div>
  )
}