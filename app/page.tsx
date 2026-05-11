'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { useCart } from '../components/CartContext'

import Header from '../components/Header'
import Footer from '../components/Footer'

// Função utilitária para "limpar" o texto (remove acentos e deixa minúsculo)
const normalizeText = (text: string) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function Storefront() {
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get('search')
  
  const { cart, setIsCartOpen } = useCart()
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // 1. Busca TODAS as categorias ordenadas pelo Drag and Drop (traz a coluna show_on_home junto)
        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .order('order_index', { ascending: true })

        // 2. Busca Todos os Produtos Ativos
        const { data: prods, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        
        if (error) throw error

        const fetchedProducts = prods || []
        const fetchedCats = cats || []

        // 3. Mantém apenas categorias que têm produtos (mesmo as ocultas, para a Busca funcionar)
        const activeCatIds = new Set(fetchedProducts.map(p => p.category_id))
        const activeCatNames = new Set(fetchedProducts.map(p => p.category))
        const populatedCats = fetchedCats.filter(c => activeCatIds.has(c.id) || activeCatNames.has(c.name))

        setCategories(populatedCats)
        setProducts(fetchedProducts)

        // 4. PESQUISA INTELIGENTE (Se houver termo na URL)
        if (urlSearch) {
          const termNorm = normalizeText(urlSearch)
          
          const filtered = fetchedProducts.filter(product => {
            // Descobre o nome da categoria usando o ID (para a busca funcionar com os novos UUIDs)
            const catName = fetchedCats.find(c => c.id === product.category_id)?.name || product.category || ""
            
            const nameNorm = normalizeText(product.name || "")
            const descNorm = normalizeText(product.description || "")
            const catNorm = normalizeText(catName)

            return nameNorm.includes(termNorm) || descNorm.includes(termNorm) || catNorm.includes(termNorm)
          })
          setFilteredProducts(filtered)
        } else {
          setFilteredProducts(fetchedProducts)
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

  // COMPONENTE DE CARD REUTILIZÁVEL
  const ProductCard = ({ product }: { product: any }) => {
    // Busca o nome legível da categoria baseado no ID ou no texto antigo
    const categoryName = categories.find(c => c.id === product.category_id)?.name || product.category || 'Sem Categoria'

    return (
      <div className="group relative flex flex-col">
        <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 group-hover:opacity-80 transition-all duration-700 shadow-sm relative border border-gray-100">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover object-center" />
          ) : (
             <div className="h-full w-full flex items-center justify-center text-[8px] font-black uppercase text-gray-300">Sem Imagem</div>
          )}
          {product.stock <= 0 && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-[8px] font-black uppercase text-red-600 shadow-sm">
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
    )
  }

  // Filtramos as categorias que de fato vão aparecer na Vitrine
  // O !== false garante que categorias antigas (null) não desapareçam caso o banco demore a atualizar
  const homeDisplayCategories = categories.filter(c => c.show_on_home !== false)

  return (
    <div className="bg-white">
      <Header 
        cartCount={cart.length} 
        onOpenCart={() => setIsCartOpen(true)} 
        isAbsolute={false} 
      />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 min-h-screen">
        
        {/* ESTADO 1: RESULTADOS DE BUSCA */}
        {urlSearch ? (
          <div className="animate-in fade-in duration-500">
            <div className="border-b border-gray-100 pb-8 mb-12">
              <h2 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">
                Busca: {urlSearch}_
              </h2>
              <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Encontrados {filteredProducts.length} resultados inteligentes
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-3xl">
                <p className="text-gray-400 uppercase tracking-widest text-[10px] font-black">
                  Nenhum resultado para "{urlSearch}"_
                </p>
                <a href="/" className="mt-6 inline-block text-[10px] font-black uppercase border-b-2 border-gray-900 pb-1 hover:opacity-50 transition-opacity">
                  Ver Catálogo Completo
                </a>
              </div>
            )}
          </div>
        ) : (
          
          /* ESTADO 2: VITRINE AGRUPADA POR CATEGORIAS (PÁGINA INICIAL PADRÃO) */
          <div className="space-y-24 animate-in fade-in duration-500">
            {homeDisplayCategories.map(category => {
              // Pega os produtos que pertencem a esta categoria específica
              const catProducts = products.filter(p => p.category_id === category.id || p.category === category.name)

              // Se não tiver produtos ativos, renderizamos nada (fallback extra de segurança)
              if (catProducts.length === 0) return null

              return (
                <section key={category.id} className="space-y-8">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">
                      {category.name}_
                    </h2>
                    <a href={`/category/${encodeURIComponent(category.name)}`} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
                      Ver Coleção Completa
                    </a>
                  </div>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Mostra no máximo 4 produtos como prévia na Home */}
                    {catProducts.slice(0, 4).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              )
            })}

            {homeDisplayCategories.length === 0 && (
              <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-3xl">
                <p className="text-gray-400 uppercase tracking-widest text-[10px] font-black">
                  Nenhuma coleção em destaque no momento_
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <Storefront />
    </Suspense>
  )
}