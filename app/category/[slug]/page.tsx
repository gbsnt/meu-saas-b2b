'use client'

import { useState, useEffect, use } from 'react' // ou Suspense, dependendo de como você colou
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { useCart } from '../../../components/CartContext'

import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import Breadcrumb from '../../../components/Breadcrumb' // se estiver usando

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { cart, setIsCartOpen } = useCart()
  
  const [products, setProducts] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [activeSub, setActiveSub] = useState<string | null>(null) // Filtro dinâmico
  const [loading, setLoading] = useState(true)

  // Decodifica o nome da categoria para exibição e busca
  const categoryName = decodeURIComponent(slug)

  useEffect(() => {
    async function loadCategoryData() {
      try {
        setLoading(true)
        
        // 1. Encontrar o ID da categoria baseada no nome da URL
        const { data: catData } = await supabase
          .from('categories')
          .select('id, name')
          .ilike('name', categoryName)
          .single()

        let fetchedProducts: any[] = []

        if (catData) {
          // 2. Se a categoria existir, busca as Subcategorias atreladas a ela
          const { data: subs } = await supabase
            .from('subcategories')
            .select('*')
            .eq('category_id', catData.id)
            .order('order_index', { ascending: true }) // Respeita a ordem do Painel
            
          setSubcategories(subs || [])

          // 3. Busca os Produtos Ativos (Pelo UUID novo OU pelo nome antigo como fallback)
          const { data: prods, error: prodError } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .or(`category_id.eq.${catData.id},category.ilike.${categoryName}`)
            .order('created_at', { ascending: false })

          if (prodError) throw prodError
          fetchedProducts = prods || []
        } else {
          // Fallback de segurança: Se não achou a categoria na tabela nova,
          // tenta buscar os produtos antigos pelo texto puro.
          const { data: oldProds } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .ilike('category', categoryName)
            .order('created_at', { ascending: false })
            
          fetchedProducts = oldProds || []
        }

        setProducts(fetchedProducts)
      } catch (err) {
        console.error("Erro ao carregar categoria:", err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadCategoryData()
    }
  }, [slug, categoryName])

  // Aplica o filtro de subcategoria em tempo real no Frontend
  const displayedProducts = activeSub 
    ? products.filter(p => p.subcategory_id === activeSub)
    : products

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

        {/* HEADER DA CATEGORIA */}
        <div className="border-b border-gray-100 pb-6 mt-8 mb-10">
          <h1 className="text-4xl font-black italic tracking-tight text-gray-900 uppercase">
            {categoryName}_
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
            Mostrando {displayedProducts.length} itens ativos
          </p>

          {/* BARRA DE FILTRO POR SUBCATEGORIA (Se existirem subcategorias) */}
          {subcategories.length > 0 && (
            <div className="mt-8 flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              <button 
                onClick={() => setActiveSub(null)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeSub === null 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                }`}
              >
                Ver Tudo
              </button>
              {subcategories.map(sub => (
                <button 
                  key={sub.id}
                  onClick={() => setActiveSub(sub.id)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeSub === sub.id 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 border border-gray-100'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid de Produtos */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-500">
            {displayedProducts.map((product) => (
              <div key={product.id} className="group relative flex flex-col">
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-50 group-hover:opacity-80 transition-all duration-500 shadow-sm relative border border-gray-100">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="h-full w-full object-cover object-center" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[8px] font-black uppercase text-gray-300">Sem Imagem</div>
                  )}
                  
                  {/* Selo de Esgotado */}
                  {product.stock <= 0 && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded text-[9px] font-black uppercase text-red-600 shadow-sm">
                      Sold Out
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-start px-1">
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
                    R$ {product.price?.toFixed(2)}
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
                Nenhum produto ativo encontrado com este filtro_
              </p>
              <div className="mt-8">
                {activeSub ? (
                  <button 
                    onClick={() => setActiveSub(null)}
                    className="text-[10px] font-black uppercase border-b-2 border-gray-900 pb-1 hover:text-gray-500 hover:border-gray-500 transition-all"
                  >
                    Limpar Filtros
                  </button>
                ) : (
                  <a 
                    href="/" 
                    className="text-[10px] font-black uppercase border-b-2 border-gray-900 pb-1 hover:text-gray-500 hover:border-gray-500 transition-all"
                  >
                    Voltar para a Home
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}