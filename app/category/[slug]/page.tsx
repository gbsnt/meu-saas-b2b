'use client'

import { useState, useEffect, use, useMemo } from 'react'
import { supabase } from '../../../lib/supabase'
import { useCart } from '../../../components/CartContext'

// COMPONENTES STUDIO_
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import Breadcrumb from '../../../components/Breadcrumb'

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { cart, setIsCartOpen } = useCart()
  
  const [products, setProducts] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [activeSub, setActiveSub] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('newest') // ESTADO DE ORDENAÇÃO
  const [loading, setLoading] = useState(true)

  const categoryName = decodeURIComponent(slug)

  useEffect(() => {
    async function loadCategoryData() {
      try {
        setLoading(true)
        const { data: catData } = await supabase.from('categories').select('id, name').ilike('name', categoryName).single()

        if (catData) {
          const { data: subs } = await supabase.from('subcategories').select('*').eq('category_id', catData.id).order('order_index', { ascending: true })
          setSubcategories(subs || [])

          const { data: prods } = await supabase.from('products').select('*').eq('is_active', true).or(`category_id.eq.${catData.id},category.ilike.${categoryName}`)
          setProducts(prods || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (slug) loadCategoryData()
  }, [slug, categoryName])

  // LÓGICA DE FILTRO E ORDENAÇÃO (USEMEMO PARA PERFORMANCE)
  const processedProducts = useMemo(() => {
    let result = [...products]

    // 1. Filtrar por Subcategoria
    if (activeSub) {
      result = result.filter(p => p.subcategory_id === activeSub)
    }

    // 2. Ordenar
    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return 0
    })

    return result
  }, [products, activeSub, sortBy])

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse bg-white">
      Sincronizando Categoria_
    </div>
  )

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} isAbsolute={false} />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ name: categoryName }]} />

        <div className="border-b border-gray-100 pb-8 mt-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">
                {categoryName}_
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                {processedProducts.length} Itens em exibição
              </p>
            </div>

            {/* BOTÕES DE ORDENAÇÃO MINIMALISTAS */}
            <div className="flex items-center gap-4 border-l md:border-l-0 md:pl-0 pl-4 border-gray-100">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Ordenar_</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 bg-transparent outline-none cursor-pointer hover:text-gray-400 transition-colors"
              >
                <option value="newest">Novidades</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>
          </div>

          {/* FILTRO DE SUBCATEGORIAS */}
          {subcategories.length > 0 && (
            <div className="mt-10 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setActiveSub(null)}
                className={`whitespace-nowrap px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeSub === null ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                Tudo_
              </button>
              {subcategories.map(sub => (
                <button 
                  key={sub.id}
                  onClick={() => setActiveSub(sub.id)}
                  className={`whitespace-nowrap px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                    activeSub === sub.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {sub.name}_
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GRID DE PRODUTOS */}
        {processedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-700">
            {processedProducts.map((product) => (
              <div key={product.id} className="group relative flex flex-col">
                <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 group-hover:opacity-80 transition-all duration-700 relative border border-gray-100">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover object-center" />
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-[8px] font-black uppercase text-red-600">
                      Sold Out
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-between items-start px-1">
                  <div>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight">
                      <a href={`/product/${product.id}`}>
                        <span className="absolute inset-0" aria-hidden="true" />
                        {product.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      {categoryName}
                    </p>
                  </div>
                  <p className="text-xs font-black text-gray-900 tabular-nums italic bg-gray-50 px-2 py-1 rounded">
                    R$ {product.price?.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-gray-400 uppercase tracking-widest text-[10px] font-black">Nenhum item encontrado_</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}