'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { 
  DocumentPlusIcon, 
  DocumentTextIcon, 
  TrashIcon, 
  PencilSquareIcon 
} from '@heroicons/react/24/outline'

interface CustomPage {
  id: string
  title: string
  slug: string
  is_published: boolean
  created_at: string
}

export default function PagesAdmin() {
  const [pages, setPages] = useState<CustomPage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('custom_pages')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPages(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta página?')) return
    
    const { error } = await supabase.from('custom_pages').delete().eq('id', id)
    if (!error) {
      setPages(pages.filter(p => p.id !== id))
    } else {
      alert('Erro ao deletar página.')
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900">Páginas_</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
            Construtor Visual de Landing Pages
          </p>
        </div>
        
        {/* BOTÃO QUE CHAMA O BUILDER */}
        <Link 
          href="/admin/pages/builder" 
          className="flex items-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl active:scale-95"
        >
          <DocumentPlusIcon className="h-4 w-4" />
          Criar Nova Página_
        </Link>
      </div>

      {loading ? (
        <div className="p-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">
          Carregando Páginas_
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-20 flex flex-col items-center justify-center text-center shadow-sm">
          <DocumentTextIcon className="h-16 w-16 text-gray-200 mb-6" />
          <h3 className="text-lg font-black uppercase tracking-widest text-gray-900 mb-2">Nenhuma Página Criada</h3>
          <p className="text-xs text-gray-400 font-medium">Suas landing pages customizadas aparecerão aqui.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Página</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">URL (Slug)</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black uppercase tracking-widest text-gray-900">{page.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(page.created_at).toLocaleDateString('pt-BR')}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-md">/{page.slug}</span>
                  </td>
                  <td className="px-8 py-6">
                    {page.is_published ? (
                      <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">Online</span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">Rascunho</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/pages/builder?id=${page.id}`} className="p-2 text-gray-400 hover:text-gray-900 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow transition-all">
                        <PencilSquareIcon className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDelete(page.id)} className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow transition-all">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}