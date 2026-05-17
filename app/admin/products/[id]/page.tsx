'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabase' // Ajuste o caminho se necessário
import { TrashIcon, ArrowUpIcon, ArrowDownIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  
  // Novos estados para a Hierarquia
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [tabs, setTabs] = useState<any[]>([])

  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: '',    
    subcategory_id: '', 
    line: '', 
    image_url: '',
    is_active: true,
    features_title: '',
    features_description: '',
    weight: 0,
    length: 0,
    width: 0,
    height: 0
  })

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      try {
        setLoading(true)
        
        // 1. Busca Categorias e Subcategorias primeiro
        const { data: cats } = await supabase.from('categories').select('*').order('name')
        const { data: subs } = await supabase.from('subcategories').select('*').order('name')
        setCategories(cats || [])
        setSubcategories(subs || [])

        // 2. Busca o Produto
        const { data: p, error: pError } = await supabase.from('products').select('*').eq('id', id).single()
        if (pError) throw new Error(pError.message)

        if (p) {
          setProduct({
            name: p.name || '',
            description: p.description || '',
            price: p.price || 0,
            stock: p.stock || 0,
            category_id: p.category_id || '',       
            subcategory_id: p.subcategory_id || '', 
            line: p.line || '',
            image_url: p.image_url || '',
            is_active: p.is_active ?? true,
            features_title: p.features_title || '',
            features_description: p.features_description || '',
            weight: p.weight || 0,
            length: p.length || 0,
            width: p.width || 0,
            height: p.height || 0
          })
          setTabs(p.specs_tabs || [])
        }
      } catch (err: any) {
        setLoadingError(err.message)
      } finally {
        setLoading(false) 
      }
    }
    fetchData()
  }, [id])

  // Lógica das Abas Técnicas
  const addTab = () => setTabs([...tabs, { id: Date.now().toString(), name: '', title: '', description: '', image: '' }])
  const updateTab = (index: number, field: string, value: string) => {
    const newTabs = [...tabs]; newTabs[index][field] = value; setTabs(newTabs);
  }
  const removeTab = (index: number) => setTabs(tabs.filter((_, i) => i !== index))
  const moveTab = (index: number, direction: 'up' | 'down') => {
    const newTabs = [...tabs];
    if (direction === 'up' && index > 0) [newTabs[index], newTabs[index - 1]] = [newTabs[index - 1], newTabs[index]]
    if (direction === 'down' && index < tabs.length - 1) [newTabs[index], newTabs[index + 1]] = [newTabs[index + 1], newTabs[index]]
    setTabs(newTabs)
  }

  // Manipulador de Mudança da Categoria Pai (Limpa a subcategoria)
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProduct({
      ...product,
      category_id: e.target.value,
      subcategory_id: '' 
    })
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    
    // Tratamento para garantir que IDs vazios virem NULL no banco
    const updateData = {
      ...product,
      category_id: product.category_id || null,
      subcategory_id: product.subcategory_id || null,
      specs_tabs: tabs
    }

    const { error } = await supabase.from('products').update(updateData).eq('id', id)
    
    setSaving(false)
    if (!error) {
      router.push('/admin/products')
      router.refresh()
    } else {
      alert("Erro ao salvar: " + error.message)
    }
  }

  if (loading) return <div className="p-10 text-center uppercase text-xs font-black animate-pulse text-gray-400 mt-20">Carregando Painel_</div>
  if (loadingError) return <div className="p-10 text-center text-red-500 font-bold">{loadingError}</div>

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">Editar Produto_</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Gestão de Catálogo e Logística</p>
        </div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors"><ChevronLeftIcon className="h-4 w-4" /> Voltar</button>
      </div>

      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-4">1. Informações Básicas</h2>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do Produto</label>
            <input type="text" required value={product.name} onChange={e => setProduct({...product, name: e.target.value})} className="w-full border-b-2 border-gray-100 pb-2 focus:border-gray-900 outline-none text-lg font-bold uppercase text-gray-900" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição Storytelling</label>
            <textarea rows={4} value={product.description} onChange={e => setProduct({...product, description: e.target.value})} className="w-full border-2 border-gray-100 rounded-lg p-4 focus:border-gray-900 outline-none text-sm text-gray-600 resize-none"></textarea>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-4">2. Inventário</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preço (R$)</label>
                <input type="number" step="0.01" required value={product.price || ''} onChange={e => setProduct({...product, price: parseFloat(e.target.value) || 0})} className="w-full border-b-2 border-gray-100 pb-2 focus:border-gray-900 outline-none text-2xl font-black text-gray-900 tabular-nums" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estoque Real</label>
                <input type="number" required value={product.stock || ''} onChange={e => setProduct({...product, stock: parseInt(e.target.value) || 0})} className="w-full border-b-2 border-gray-100 pb-2 focus:border-gray-900 outline-none text-2xl font-black text-gray-900 tabular-nums" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-4">3. Logística (Embalagem)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Peso (kg)</label><input type="number" step="0.001" value={product.weight || ''} onChange={e => setProduct({...product, weight: parseFloat(e.target.value) || 0})} className="w-full border-b-2 border-gray-100 focus:border-gray-900 outline-none text-sm font-bold" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Comp. (cm)</label><input type="number" value={product.length || ''} onChange={e => setProduct({...product, length: parseFloat(e.target.value) || 0})} className="w-full border-b-2 border-gray-100 focus:border-gray-900 outline-none text-sm font-bold" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Largura (cm)</label><input type="number" value={product.width || ''} onChange={e => setProduct({...product, width: parseFloat(e.target.value) || 0})} className="w-full border-b-2 border-gray-100 focus:border-gray-900 outline-none text-sm font-bold" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Altura (cm)</label><input type="number" value={product.height || ''} onChange={e => setProduct({...product, height: parseFloat(e.target.value) || 0})} className="w-full border-b-2 border-gray-100 focus:border-gray-900 outline-none text-sm font-bold" /></div>
            </div>
          </div>
        </div>

        {/* NOVA ÁREA DE ORGANIZAÇÃO (CASCATA) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-4">4. Organização</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria Principal</label>
                <select 
                  required
                  value={product.category_id} 
                  onChange={handleCategoryChange} 
                  className="w-full border-b-2 border-gray-100 pb-2 focus:border-gray-900 outline-none bg-transparent text-sm font-bold uppercase text-gray-900"
                >
                  <option value="">Selecione a Categoria Pai...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subcategoria</label>
                <select 
                  value={product.subcategory_id} 
                  onChange={e => setProduct({...product, subcategory_id: e.target.value})} 
                  disabled={!product.category_id}
                  className="w-full border-b-2 border-gray-100 pb-2 focus:border-gray-900 outline-none bg-transparent text-sm font-bold uppercase text-gray-900 disabled:opacity-40"
                >
                  <option value="">Sem Subcategoria</option>
                  {subcategories
                    .filter(sub => sub.category_id === product.category_id)
                    .map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)
                  }
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <input type="checkbox" id="active" checked={product.is_active} onChange={e => setProduct({...product, is_active: e.target.checked})} className="w-4 h-4 accent-gray-900" />
                <label htmlFor="active" className="text-xs font-bold uppercase tracking-widest text-gray-900">Produto Ativo na Loja</label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-4">5. Mídia Principal</h2>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">URL da Imagem</label>
              <input type="url" value={product.image_url} onChange={e => setProduct({...product, image_url: e.target.value})} className="w-full border-b-2 border-gray-100 pb-2 focus:border-gray-900 outline-none text-xs text-gray-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-4">6. Seção Técnica</h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
            <input type="text" value={product.features_title} onChange={e => setProduct({...product, features_title: e.target.value})} placeholder="Título da Seção" className="w-full border-b border-gray-200 bg-transparent pb-2 focus:border-gray-900 outline-none text-lg font-bold uppercase" />
            <textarea rows={2} value={product.features_description} onChange={e => setProduct({...product, features_description: e.target.value})} placeholder="Descrição da Seção" className="w-full border-2 border-gray-200 bg-white rounded-lg p-3 focus:border-gray-900 outline-none text-sm resize-none"></textarea>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Abas</h3>
            <button type="button" onClick={addTab} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors">+ Adicionar Aba</button>
          </div>
          <div className="space-y-6">
            {tabs.map((tab, index) => (
              <div key={tab.id} className="relative border border-gray-200 rounded-lg p-6 bg-gray-50/30 group">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button type="button" onClick={() => moveTab(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-20"><ArrowUpIcon className="h-4 w-4" /></button>
                  <button type="button" onClick={() => moveTab(index, 'down')} disabled={index === tabs.length - 1} className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-20"><ArrowDownIcon className="h-4 w-4" /></button>
                  <button type="button" onClick={() => removeTab(index)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input type="text" placeholder="Nome na Aba" value={tab.name} onChange={e => updateTab(index, 'name', e.target.value)} className="w-full border-b border-gray-200 bg-transparent text-sm font-bold uppercase" />
                  <input type="text" placeholder="Título Interno" value={tab.title} onChange={e => updateTab(index, 'title', e.target.value)} className="w-full border-b border-gray-200 bg-transparent text-sm font-bold" />
                  <input type="text" placeholder="URL da Imagem" className="col-span-2 w-full border-b border-gray-200 bg-transparent text-xs text-gray-500" value={tab.image} onChange={e => updateTab(index, 'image', e.target.value)} />
                  <textarea rows={3} placeholder="Descrição" value={tab.description} onChange={e => updateTab(index, 'description', e.target.value)} className="col-span-2 w-full border-2 border-gray-200 bg-white rounded p-3 text-sm"></textarea>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 flex justify-end gap-4 z-50 shadow-2xl">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-12 py-4 rounded text-xs font-black uppercase tracking-widest hover:bg-gray-800 shadow-xl disabled:opacity-50">{saving ? 'Gravando...' : 'Salvar Alterações'}</button>
        </div>
      </form>
    </div>
  )
}