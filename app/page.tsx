'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { useCart } from '../components/CartContext'

import Header from '../components/Header'
import Footer from '../components/Footer'

const normalizeText = (text: string) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function Storefront() {
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get('search')
  
  const { cart, setIsCartOpen } = useCart()
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // 1. Busca Categorias
        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .order('order_index', { ascending: true })

        // 2. NOVIDADE: Busca Subcategorias (com a flag show_on_home)
        const { data: subs } = await supabase
          .from('subcategories')
          .select('*')
          .order('order_index', { ascending: true })

        // 3. Busca Produtos Ativos
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        setCategories(cats || [])
        setSubcategories(subs || [])
        setProducts(prods || [])

        if (urlSearch) {
          const termNorm = normalizeText(urlSearch)
          const filtered = (prods || []).filter(product => {
            const catName = (cats || []).find(c => c.id === product.category_id)?.name || ""
            const subName = (subs || []).find(s => s.id === product.subcategory_id)?.name || ""
            return normalizeText(product.name).includes(termNorm) || 
                   normalizeText(catName).includes(termNorm) || 
                   normalizeText(subName).includes(termNorm)
          })
          setFilteredProducts(filtered)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (isMounted) loadData()
  }, [urlSearch, isMounted])

  if (!isMounted || loading) return (
    <div className="h-screen flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse bg-white">
      Sincronizando STUDIO_
    </div>
  )

  const ProductCard = ({ product }: { product: any }) => {
    const categoryName = categories.find(c => c.id === product.category_id)?.name || 'Coleção'
    return (
      <div className="group relative flex flex-col">
        <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 group-hover:opacity-80 transition-all duration-700 shadow-sm relative border border-gray-100">
          {product.image_url && <img src={product.image_url} alt={product.name} className="h-full w-full object-cover object-center" />}
          {product.stock <= 0 && <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-[8px] font-black uppercase text-red-600 shadow-sm">Sold Out</div>}
        </div>
        <div className="mt-6 flex justify-between items-start px-1">
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight">
              <a href={`/product/${product.id}`}><span className="absolute inset-0" />{product.name}</a>
            </h3>
            <p className="mt-1 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{categoryName}</p>
          </div>
          <p className="text-xs font-black text-gray-900 italic bg-gray-50 px-2 py-1 rounded">R$ {product.price?.toFixed(2)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <Header cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} isAbsolute={false} />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 min-h-screen">
        {urlSearch ? (
          /* BUSCA */
          <div className="animate-in fade-in duration-500">
            <h2 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase mb-12 border-b border-gray-100 pb-8">Busca: {urlSearch}_</h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        ) : (
          /* VITRINE DINÂMICA */
          <div className="space-y-32">
            {categories.filter(c => c.show_on_home !== false).map(category => {
              const categoryProducts = products.filter(p => p.category_id === category.id)
              // Subcategorias desta categoria que devem aparecer na home
              const featuredSubs = subcategories.filter(s => s.category_id === category.id && s.show_on_home !== false)

              if (categoryProducts.length === 0) return null

              return (
                <section key={category.id} className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <div className="flex items-center justify-between border-b border-gray-900/5 pb-6 mb-10">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900">{category.name}_</h2>
                    <a href={`/category/${encodeURIComponent(category.name)}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-all">Explorar Coleção</a>
                  </div>

                  {/* SE EXISTIREM SUBCATEGORIAS EM DESTAQUE, MOSTRA ASSECÇÕES DELAS */}
                  {featuredSubs.length > 0 ? (
                    <div className="space-y-16">
                      {featuredSubs.map(sub => {
                        const subProducts = categoryProducts.filter(p => p.subcategory_id === sub.id)
                        if (subProducts.length === 0) return null
                        return (
                          <div key={sub.id} className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                              <span className="w-4 h-[1px] bg-gray-200"></span> {sub.name}
                            </h3>
                            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                              {subProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
                            </div>
                          </div>
                        )
                      })}
                      
                      {/* Produtos na categoria principal que NÃO estão em subcategorias destacadas */}
                      {categoryProducts.filter(p => !featuredSubs.some(s => s.id === p.subcategory_id)).length > 0 && (
                        <div className="space-y-6">
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                            <span className="w-4 h-[1px] bg-gray-200"></span> Outros {category.name}
                          </h3>
                          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                            {categoryProducts.filter(p => !featuredSubs.some(s => s.id === p.subcategory_id)).slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* SE NÃO HOUVER SUBS EM DESTAQUE, MOSTRA GRID SIMPLES */
                    <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                      {categoryProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default function HomePage() {
  return <Suspense fallback={null}><Storefront /></Suspense>
}