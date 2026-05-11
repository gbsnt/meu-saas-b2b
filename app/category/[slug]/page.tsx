'use client'

import { useState, useEffect, use } from 'react'
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
  const [loading, setLoading] = useState(true)

  // Decodifica o nome da categoria para exibição (ex: de "Moveis%20Design" para "Moveis Design")
  const categoryName = decodeURIComponent(slug)

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        
        // Buscamos no Supabase com filtros de segurança
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)             // REGRA 1: Tem que estar ativo
          .ilike('category', categoryName)    // REGRA 2: Categoria igual (ignora maiúsculas/minúsculas)
          .order('created_at', { ascending: false })

        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        console.error("Erro ao carregar categoria:", err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadProducts()
    }
  }, [slug, categoryName])

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-xs uppercase tracking-widest text-gray-400 animate-pulse font-black">
      Sincronizando Categoria_
    </div>
  )

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header 
        cartCount={cart.length} 
        onOpenCart={() => setIsCartOpen(true)} 
        isAbsolute={false} 
      />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Navegação Auxiliar */}
        <Breadcrumb 
          items={[
            { name: 'Shop', href: '/' },
            { name: categoryName }
          ]} 
        />

        {/* Título da Categoria */}
        <div className="border-b border-gray-200 pb-4 mt-8 mb-12">
          <h1 className="text-4xl font-black italic tracking-tight text-gray-900 uppercase">
            {categoryName}_
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
            Mostrando {products.length} itens ativos
          </p>
        </div>

        {/* Grid de Produtos */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div key={product.id} className="group relative flex flex-col">
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 group-hover:opacity-80 transition-all duration-500 shadow-sm relative border border-gray-50">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="h-full w-full object-cover object-center" 
                  />
                  
                  {/* Selo de Esgotado */}
                  {product.stock <= 0 && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded text-[9px] font-black uppercase text-red-600 shadow-sm">
                      Sold Out
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-start">
                  <div className="max-w-[70%]">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight leading-tight">
                      <a href={`/product/${product.id}`}>
                        <span className="absolute inset-0" aria-hidden="true" />
                        {product.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                      {product.line || categoryName}
                    </p>
                  </div>
                  <p className="text-sm font-black text-gray-900 tabular-nums italic">
                    R$ {product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Estado Vazio */
          <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-3xl">
            <div className="max-w-xs mx-auto">
              <p className="text-gray-400 uppercase tracking-widest text-[11px] font-black leading-relaxed">
                Nenhum produto ativo encontrado nesta categoria no momento_
              </p>
              <div className="mt-8">
                <a 
                  href="/" 
                  className="text-[10px] font-black uppercase border-b-2 border-gray-900 pb-1 hover:text-gray-500 hover:border-gray-500 transition-all"
                >
                  Voltar para a Home
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}