'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { 
  TrashIcon, LinkSlashIcon,
  PencilSquareIcon, CheckIcon, XMarkIcon, Bars2Icon, Bars3Icon,
  ArrowDownTrayIcon, HomeIcon
} from '@heroicons/react/24/outline'
import { HomeIcon as HomeIconSolid } from '@heroicons/react/24/solid'

import { 
  DndContext, closestCorners, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, DragEndEvent, useDroppable
} from '@dnd-kit/core'
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, 
  verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// --- COMPONENTES DE ARRASTO E DROP ---

function MainCategoryDropZone({ id }: { id: string }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `main-drop-${id}`,
    data: { type: 'CategoryMain', catId: id }
  })

  return (
    <div 
      ref={setNodeRef}
      className={`
        mb-4 border-2 border-dashed rounded-lg p-2 transition-all flex items-center justify-center gap-2
        ${isOver ? 'border-gray-900 bg-gray-900/5 text-gray-900 scale-[1.02]' : 'border-gray-100 text-gray-300'}
      `}
    >
      <ArrowDownTrayIcon className="h-3 w-3" />
      <span className="text-[9px] font-black uppercase tracking-widest">Mover para Principal_</span>
    </div>
  )
}

function SortableCategory({ id, category, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id, data: { type: 'Category', item: category }
  })
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.4 : 1 }
  return <div ref={setNodeRef} style={style}>{children({ attributes, listeners })}</div>
}

function SortableSubcategory({ id, subcategory, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id, data: { type: 'Subcategory', item: subcategory }
  })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  return <div ref={setNodeRef} style={style}>{children({ attributes, listeners })}</div>
}

function DraggableProduct({ id, product, children }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id, data: { type: 'Product', item: product }
  })
  const style = { transform: CSS.Translate.toString(transform), zIndex: isDragging ? 100 : 'auto', opacity: isDragging ? 0.5 : 1 }
  return <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing touch-none">{children}</div>
}

// --- COMPONENTE PRINCIPAL ---

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false) 
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newSub, setNewSub] = useState<{ [key: string]: string }>({})

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), 
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function loadData() {
    setLoading(true)
    try {
      const { data: cats } = await supabase.from('categories').select('*').order('order_index', { ascending: true })
      const { data: subs } = await supabase.from('subcategories').select('*').order('order_index', { ascending: true })
      const { data: prods } = await supabase.from('products').select('id, name, category_id, category, subcategory_id, is_active')

      setCategories(cats || [])
      setSubcategories(subs || [])
      setProducts(prods || [])
    } catch (error) {
      alert("Erro ao sincronizar dados.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleToggleHomeVisibility(id: string, currentStatus: boolean) {
    const { error } = await supabase.from('categories').update({ show_on_home: !currentStatus }).eq('id', id)
    if (!error) setCategories(prev => prev.map(c => c.id === id ? { ...c, show_on_home: !currentStatus } : c))
  }

  async function handleToggleSubHomeVisibility(id: string, currentStatus: boolean) {
    const { error } = await supabase.from('subcategories').update({ show_on_home: !currentStatus }).eq('id', id)
    if (!error) setSubcategories(prev => prev.map(s => s.id === id ? { ...s, show_on_home: !currentStatus } : s))
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const activeData = active.data.current
    const overData = over.data.current
    if (!activeData || !overData) return

    if (activeData.type === 'Category' && overData.type === 'Category') {
      if (active.id === over.id) return
      setCategories((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        const newOrder = arrayMove(items, oldIndex, newIndex)
        Promise.all(newOrder.map((cat, index) => supabase.from('categories').update({ order_index: index }).eq('id', cat.id)))
        return newOrder
      })
    }
    else if (activeData.type === 'Subcategory' && overData.type === 'Subcategory') {
      if (active.id === over.id) return
      if (activeData.item.category_id === overData.item.category_id) {
        setSubcategories((items) => {
          const oldIndex = items.findIndex(item => item.id === active.id)
          const newIndex = items.findIndex(item => item.id === over.id)
          const newOrder = arrayMove(items, oldIndex, newIndex)
          Promise.all(newOrder.map((sub, index) => supabase.from('subcategories').update({ order_index: index }).eq('id', sub.id)))
          return newOrder
        })
      }
    }
    else if (activeData.type === 'Product') {
      let newCatId = activeData.item.category_id
      let newSubId = activeData.item.subcategory_id
      if (overData.type === 'CategoryMain') { newCatId = overData.catId; newSubId = null; } 
      else if (overData.type === 'Subcategory') { newCatId = overData.item.category_id; newSubId = over.id; }
      else if (overData.type === 'Product') { newCatId = overData.item.category_id; newSubId = overData.item.subcategory_id; }
      else if (overData.type === 'Category') { newCatId = over.id; newSubId = null; }
      if (newCatId === activeData.item.category_id && newSubId === activeData.item.subcategory_id) return
      setProducts(prev => prev.map(p => p.id === active.id ? { ...p, category_id: newCatId, subcategory_id: newSubId } : p))
      await supabase.from('products').update({ category_id: newCatId, subcategory_id: newSubId, category: null }).eq('id', active.id)
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault(); if (!newCategory.trim() || processing) return;
    setProcessing(true);
    const { error } = await supabase.from('categories').insert([{ name: newCategory.trim(), order_index: categories.length, show_on_home: true }]);
    if (!error) { setNewCategory(''); await loadData(); }
    setProcessing(false);
  }

  async function handleUpdateCategory(id: string) {
    if (!editName.trim()) return;
    setProcessing(true);
    const { error } = await supabase.from('categories').update({ name: editName.trim() }).eq('id', id);
    if (!error) { setEditingId(null); await loadData(); }
    setProcessing(false);
  }

  async function handleUnlinkProduct(productId: string) {
    setProcessing(true);
    const { error } = await supabase.from('products').update({ category_id: null, subcategory_id: null, category: null }).eq('id', productId);
    if (!error) await loadData();
    setProcessing(false);
  }

  async function handleAddSub(catId: string) {
    const name = newSub[catId]?.trim(); if (!name || processing) return;
    setProcessing(true);
    const subsCount = subcategories.filter(s => s.category_id === catId).length;
    const { error } = await supabase.from('subcategories').insert([{ name, category_id: catId, order_index: subsCount, show_on_home: true }]);
    if (!error) { setNewSub({ ...newSub, [catId]: '' }); await loadData(); }
    setProcessing(false);
  }

  async function handleDelete(id: string, table: 'categories' | 'subcategories') {
    if (!confirm("Deseja excluir este item?")) return;
    setProcessing(true);
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) alert(error.code === '23503' ? "Existem vínculos ativos." : error.message);
    else await loadData();
    setProcessing(false);
  }

  return (
    /* 🚀 ATUALIZADO: Trocado max-w-6xl mx-auto por w-full para se ajustar perfeitamente ao grid fluido do admin */
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 w-full">
      <header>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">Estrutura_</h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Organize categorias, subs e arraste produtos livremente</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm sticky top-28">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-gray-900">Nova Categoria Pai_</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <input 
                type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="EX: ACESSÓRIOS"
                className="w-full border-b-2 border-gray-100 py-3 focus:border-gray-900 outline-none text-sm font-bold uppercase transition-all"
              />
              <button disabled={processing} className="w-full bg-gray-900 text-white py-4 rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl active:scale-95">
                {processing ? '...' : 'Registrar'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest animate-pulse">Sincronizando Database_</div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
              <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-6">
                  {categories.map(cat => {
                    const isEditing = editingId === cat.id
                    const linkedProducts = products.filter(p => p.category_id === cat.id && !p.subcategory_id)
                    const catSubcategories = subcategories.filter(s => s.category_id === cat.id)

                    return (
                      <SortableCategory key={cat.id} id={cat.id} category={cat}>
                        {({ attributes, listeners }: any) => (
                          <div className={`bg-white rounded-2xl border transition-all ${isEditing ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-100 shadow-sm'}`}>
                            
                            <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                              <div className="flex items-center gap-4 w-full">
                                <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-900 cursor-grab p-1 touch-none">
                                  <Bars2Icon className="h-5 w-5" />
                                </button>
                                
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => handleToggleHomeVisibility(cat.id, cat.show_on_home)}
                                    className={`transition-colors p-1 rounded hover:bg-gray-200/50 ${cat.show_on_home ? 'text-gray-900' : 'text-gray-300'}`}
                                  >
                                    {cat.show_on_home ? <HomeIconSolid className="h-4 w-4" /> : <HomeIcon className="h-4 w-4" />}
                                  </button>

                                  {isEditing ? (
                                    <input 
                                      className="bg-transparent text-sm font-black uppercase italic outline-none border-b border-gray-900 w-full mr-4"
                                      value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                                    />
                                  ) : (
                                    <span className="text-sm font-black uppercase italic tracking-tight text-gray-900">{cat.name}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isEditing ? (
                                  <><button onClick={() => handleUpdateCategory(cat.id)} className="text-green-600 p-1"><CheckIcon className="h-5 w-5"/></button><button onClick={() => setEditingId(null)} className="text-red-400 p-1"><XMarkIcon className="h-5 w-5"/></button></>
                                ) : (
                                  <><button onClick={() => {setEditingId(cat.id); setEditName(cat.name)}} className="text-gray-300 hover:text-gray-900 p-1"><PencilSquareIcon className="h-4 w-4"/></button><button onClick={() => handleDelete(cat.id, 'categories')} className="text-gray-200 hover:text-red-500 p-1"><TrashIcon className="h-4 w-4"/></button></>
                                )}
                              </div>
                            </div>

                            <div className="p-6 space-y-6">
                              <MainCategoryDropZone id={cat.id} />

                              <div className="space-y-2">
                                {linkedProducts.map(p => (
                                  <DraggableProduct key={p.id} id={p.id} product={p}>
                                    <div className="flex items-center justify-between group py-2 px-3 bg-gray-50/50 rounded-lg border border-transparent hover:border-gray-200">
                                      <div className="flex items-center gap-3">
                                        <Bars3Icon className="h-3 w-3 text-gray-300" />
                                        <div className={`h-1.5 w-1.5 rounded-full ${p.is_active ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]' : 'bg-gray-300'}`} />
                                        <span className={`text-[10px] font-bold uppercase ${p.is_active ? 'text-gray-700' : 'text-gray-400 italic'}`}>{p.name}</span>
                                      </div>
                                      <button onPointerDown={(e) => e.stopPropagation()} onClick={() => handleUnlinkProduct(p.id)} className="opacity-0 group-hover:opacity-100 text-orange-400 hover:text-orange-600 text-[9px] font-black uppercase"><LinkSlashIcon className="h-3 w-3" /></button>
                                    </div>
                                  </DraggableProduct>
                                ))}
                              </div>

                              <div className="space-y-4 pt-4 border-t border-gray-50">
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Subcategorias_</p>
                                <SortableContext items={catSubcategories.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                  {catSubcategories.map(sub => (
                                    <SortableSubcategory key={sub.id} id={sub.id} subcategory={sub}>
                                      {({ attributes, listeners }: any) => (
                                        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm space-y-3">
                                          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                            <div className="flex items-center gap-3">
                                              <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-900 cursor-grab touch-none"><Bars2Icon className="h-4 w-4" /></button>
                                              
                                              <button 
                                                onClick={() => handleToggleSubHomeVisibility(sub.id, sub.show_on_home)}
                                                className={`transition-colors ${sub.show_on_home !== false ? 'text-yellow-600' : 'text-gray-200'}`}
                                              >
                                                {sub.show_on_home !== false ? <HomeIconSolid className="h-3.5 w-3.5" /> : <HomeIcon className="h-3.5 w-3.5" />}
                                              </button>

                                              <span className="text-[11px] font-bold text-gray-600 uppercase italic">{sub.name}</span>
                                            </div>
                                            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => handleDelete(sub.id, 'subcategories')} className="text-gray-200 hover:text-red-500"><TrashIcon className="h-3.5 w-3.5" /></button>
                                          </div>
                                          <div className="pl-6 space-y-1">
                                            {products.filter(p => p.subcategory_id === sub.id).map(p => (
                                              <DraggableProduct key={p.id} id={p.id} product={p}>
                                                <div className="flex items-center justify-between group py-1.5 px-2 hover:bg-gray-50 rounded-md">
                                                  <div className="flex items-center gap-2">
                                                    <Bars3Icon className="h-3 w-3 text-gray-300" />
                                                    <div className={`h-1 w-1 rounded-full ${p.is_active ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`} />
                                                    <span className={`text-[9px] font-bold uppercase ${p.is_active ? 'text-gray-500' : 'text-gray-300 italic'}`}>{p.name}</span>
                                                  </div>
                                                  <button onPointerDown={(e) => e.stopPropagation()} onClick={() => handleUnlinkProduct(p.id)} className="opacity-0 group-hover:opacity-100 text-orange-400 hover:text-orange-600 z-10"><LinkSlashIcon className="h-3 w-3" /></button>
                                                </div>
                                              </DraggableProduct>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </SortableSubcategory>
                                  ))}
                                </SortableContext>
                              </div>

                              {!isEditing && (
                                <div className="pt-4 mt-2 border-t border-dashed border-gray-100 flex items-center gap-4">
                                  <input 
                                    type="text" placeholder="Nova Subcategoria..." value={newSub[cat.id] || ''}
                                    onChange={e => setNewSub({ ...newSub, [cat.id]: e.target.value })}
                                    className="flex-1 bg-transparent border-b border-gray-200 py-1 text-[11px] font-bold uppercase outline-none focus:border-gray-900"
                                  />
                                  <button onClick={() => handleAddSub(cat.id)} className="text-[10px] font-black text-gray-900 px-3 py-1.5 rounded border border-gray-900 hover:bg-gray-900 hover:text-white transition-all">+ ADD</button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </SortableCategory>
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  )
}