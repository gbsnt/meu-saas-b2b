'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { TrashIcon, ArrowUpIcon, ArrowDownIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [tabs, setTabs] = useState<any[]>([])

  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
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
    async function getCats() {
      const { data } = await supabase.from('categories').select('name')
      setCategories(data || [])
    }
    getCats()
  }, [])

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('products').insert([{ ...product, specs_tabs: tabs }])
    setSaving(false)
    if (!error) {
      router.push('/admin/products')
      router.refresh()
    } else alert("Erro ao criar: " + error.message)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
      {/* HEADER IGUAL AO EDIT */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">Novo Produto_</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Criação de registro mestre</p>
        </div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors">
          <ChevronLeftIcon className="h-4 w-4" /> Voltar
        </button>
      </div>

      <form onSubmit={handleCreate} className="space-y-8">
        
        {/* 1. INFORMAÇÕES BÁSICAS */}
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
          {/* 2. INVENTÁRIO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-4">2. Inventário</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preço (R$)</label>
                <input type="number" step="0.01" required value={product.price || ''} onChange={e => setProduct({...product, price: parseFloat(e.target.value) || 0})} className="w-full border-b-2 border-gray-100 pb-2 focus:border-gray-900 outline-none text-2xl font-black text-gray-900 tabular-nums" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estoque Inicial</label>
                <input type="number" required value={product.stock || ''} onChange={e => setProduct({...product, stock: parseInt(e.target.value) || 0})} className="w-full border-b-2 border-gray-100 pb-2 focus:border-gray-900 outline-none text-2xl font-black text-gray-900 tabular-nums" />
              </div>
            </div>
          </div>

          {/* 3. LOGÍSTICA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-4">3. Logística (Embalagem)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Peso (kg)</label>
                <input type="number" step="0.001" value={product.weight || ''} onChange={e => setProduct({...product, weight: parseFloat(e.target.value) || 0})} className="w-full border-b-2 border-gray-100 focus:border-gray-900 outline-none text-sm font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Comp. (cm)</label>
                <input type="number" value={product.length || ''} onChange={e => setProduct({...product, length: parseFloat(e.target.value) || 0})} className="w-full border-b-2 border-gray-100 focus:border-gray-900 outline-none text-sm font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Largura (cm)</label>
                <input type="number" value={product.width || ''} onChange={e => setProduct({...product, width: parseFloat(e.target.value) || 0})} className="w-full border-b-2 border-gray-100 focus:border-gray-900 outline-none text-sm font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Altura (cm)</label>
                <input type="number" value={product.height || ''} onChange={e => setProduct({...product, height: parseFloat(e.target.value) || 0})} className="w-full border-b-2 border-gray-100 focus:border-gray-900 outline-none text-sm font-bold" />
              </div>
            </div>
          </div>
        </div>

        {/* 4. ORGANIZAÇÃO E MÍDIA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-4">4. Organização</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</label>
                <select value={product.category} onChange={e => setProduct({...product, category: e.target.value})} className="w-full border-b-2 border-gray-100 pb-2 focus:border-gray-900 outline-none bg-transparent text-sm font-bold uppercase text-gray-900">
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="active" checked={product.is_active} onChange={e => setProduct({...product, is_active: e.target.checked})} className="w-4 h-4 accent-gray-900" />
                <label htmlFor="active" className="text-xs font-bold uppercase tracking-widest text-gray-900">Produto Ativo</label>
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

        {/* 6. ESPECIFICAÇÕES DINÂMICAS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-4">6. Seção de Especificações Técnicas</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título da Seção</label>
              <input type="text" value={product.features_title} onChange={e => setProduct({...product, features_title: e.target.value})} placeholder="Ex: Technical Specifications_" className="w-full border-b-2 border-gray-200 bg-transparent pb-2 focus:border-gray-900 outline-none text-lg font-bold uppercase" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição da Seção</label>
              <textarea rows={2} value={product.features_description} onChange={e => setProduct({...product, features_description: e.target.value})} className="w-full border-2 border-gray-200 bg-white rounded-lg p-3 focus:border-gray-900 outline-none text-sm resize-none"></textarea>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Abas Dinâmicas</h3>
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
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome na Aba</label>
                    <input type="text" value={tab.name} onChange={e => updateTab(index, 'name', e.target.value)} className="w-full border-b-2 border-gray-200 bg-transparent text-sm font-bold uppercase" />
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título Interno</label>
                    <input type="text" value={tab.title} onChange={e => updateTab(index, 'title', e.target.value)} className="w-full border-b-2 border-gray-200 bg-transparent text-sm font-bold" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">URL da Imagem</label>
                    <input type="text" value={tab.image} onChange={e => updateTab(index, 'image', e.target.value)} className="w-full border-b-2 border-gray-200 bg-transparent text-xs text-gray-500" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição</label>
                    <textarea rows={3} value={tab.description} onChange={e => updateTab(index, 'description', e.target.value)} className="w-full border-2 border-gray-200 bg-white rounded p-3 text-sm"></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BARRA DE AÇÕES FLUTUANTE */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 flex justify-end gap-4 z-50 shadow-2xl">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-12 py-4 rounded text-xs font-black uppercase tracking-widest hover:bg-gray-800 shadow-xl disabled:opacity-50">
            {saving ? 'Gravando...' : 'Cadastrar Produto'}
          </button>
        </div>
      </form>
    </div>
  )
}