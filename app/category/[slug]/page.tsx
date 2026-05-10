'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '../../../lib/supabase'

// IMPORTANDO OS NOSSOS BLOCOS (COMPONENTES)
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import Breadcrumb from '../../../components/Breadcrumb'

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados necessários para o Header funcionar
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    async function loadCategory() {
      const { data } = await supabase.from('products').select('*').ilike('category', slug)
      setProducts(data || [])
      setLoading(false)
    }
    loadCategory()
  }, [slug])

  if (loading) return <div className="h-screen flex items-center justify-center text-xs uppercase tracking-widest text-gray-400">Loading_</div>

  return (
    <div className="bg-white">
      {/* 1. HEADER COMPONENTIZADO */}
      <Header 
        cartCount={cart.length} 
        onOpenCart={() => setIsCartOpen(true)} 
        isAbsolute={false} 
      />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* 2. BREADCRUMB COMPONENTIZADO */}
        {/* Passamos apenas o nome da categoria, ele monta "Home / [Categoria]" */}
        <Breadcrumb items={[{ name: slug }]} />

        {/* Título da Categoria */}
        <h1 className="text-4xl font-black tracking-tight text-gray-900 border-b pb-8 uppercase italic">
          {slug}_
        </h1>
        
        {/* Grid de Produtos */}
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="group relative">
                <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 lg:h-80 group-hover:opacity-75 transition-opacity">
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase">
                      <a href={`/product/${product.id}`}>
                        <span className="absolute inset-0" aria-hidden="true" />
                        {product.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">{product.description}</p>
                  </div>
                  <p className="text-sm font-black text-gray-900 italic">R$ {product.price}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-32 border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">Nenhum produto encontrado em {slug}.</p>
            </div>
          )}
        </div>
      </main>

      {/* 3. FOOTER COMPONENTIZADO */}
      <Footer />
    </div>
  )
}