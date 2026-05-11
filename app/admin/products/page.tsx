'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { TrashIcon, PencilSquareIcon, CheckCircleIcon, PhotoIcon } from '@heroicons/react/24/outline'

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function loadProducts() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { loadProducts() }, [])

  async function handleStockUpdate(id: string, newStock: number) {
    setUpdatingId(id)
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', id)

    if (error) {
      alert("Erro ao atualizar estoque: " + error.message)
    } else {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p))
    }
    setTimeout(() => setUpdatingId(null), 500)
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) alert("Erro ao excluir: " + error.message)
    else loadProducts()
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">Catálogo_</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestão de inventário e mídia</p>
        </div>
        <a href="/admin/products/new" className="bg-gray-900 text-white px-6 py-3 rounded-md text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg">
          + Novo Produto
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Sincronizando STUDIO_...
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Mídia</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Produto</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Preço</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Estoque Rápido</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  {/* COLUNA DA FOTO */}
                  <td className="px-6 py-4">
                    <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
                        />
                      ) : (
                        <PhotoIcon className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900 uppercase">{product.name}</div>
                    <div className="text-[9px] text-gray-400 font-medium">ID: {product.id.slice(0, 8)}</div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-gray-500 uppercase">{product.category || 'Geral'}</span>
                  </td>
                  
                  <td className="px-6 py-4 text-sm font-medium text-gray-600 tabular-nums">R$ {product.price}</td>
                  
                  <td className="px-6 py-4">
                    <div className="relative flex items-center gap-2">
                      <input 
                        type="number"
                        defaultValue={product.stock}
                        onBlur={(e) => handleStockUpdate(product.id, parseInt(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className={`w-16 bg-transparent border-b-2 px-1 py-1 text-sm font-black transition-all outline-none text-center
                          ${updatingId === product.id ? 'border-green-500 text-green-600' : 'border-transparent focus:border-gray-900 text-gray-900'}
                        `}
                      />
                      {updatingId === product.id && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 absolute -right-6" />
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right flex justify-end gap-4 mt-2">
                    <a href={`/admin/products/${product.id}`} className="text-blue-500 hover:text-blue-700 transition-colors">
                      <PencilSquareIcon className="h-5 w-5" />
                    </a>
                    <button onClick={() => handleDelete(product.id)} className="text-red-300 hover:text-red-600 transition-colors">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Nenhum produto cadastrado no catálogo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}