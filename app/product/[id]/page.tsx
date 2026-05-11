'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '../../../lib/supabase'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { useCart } from '../../../components/CartContext' 

// COMPONENTES STUDIO_
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import Breadcrumb from '../../../components/Breadcrumb'
import ShippingCalculator from '../../../components/ShippingCalculator' // <--- ADICIONADO

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { cart, addToCart, setIsCartOpen } = useCart() 
  const [product, setProduct] = useState<any>(null)
  const [categoryName, setCategoryName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    async function loadProductData() {
      try {
        setLoading(true)
        
        // 1. Busca o Produto
        const { data: prod, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single()
        
        if (error || !prod) {
          setProduct(null)
          return
        }

        setProduct(prod)

        // 2. Busca o nome real da Categoria (via ID ou texto antigo)
        if (prod.category_id) {
          const { data: catData } = await supabase
            .from('categories')
            .select('name')
            .eq('id', prod.category_id)
            .single()
          
          if (catData) setCategoryName(catData.name)
        } else if (prod.category) {
          setCategoryName(prod.category)
        }

      } catch (err) {
        console.error("Erro ao carregar produto:", err)
      } finally {
        setLoading(false)
      }
    }
    loadProductData()
  }, [id])

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse bg-white">
      Sincronizando STUDIO_
    </div>
  )
  
  if (!product) return (
    <div className="h-screen flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 bg-white">
      Produto não encontrado_
    </div>
  )

  const specsTabs = product.specs_tabs || []

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header 
         isAbsolute={false}
         cartCount={cart.length} 
         onOpenCart={() => setIsCartOpen(true)} 
      />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          
          <Breadcrumb 
            items={[
              ...(categoryName ? [{ 
                name: categoryName, 
                href: `/category/${encodeURIComponent(categoryName)}` 
              }] : []),
              { name: product.name }
            ]} 
          />

          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12 mt-8">
            {/* GALERIA DE IMAGEM */}
            <div className="aspect-square w-full overflow-hidden rounded-xl shadow-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="h-full w-full object-cover object-center" 
                />
              ) : (
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Sem Imagem</span>
              )}
            </div>

            {/* INFO DO PRODUTO */}
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                   {categoryName}_
                 </p>
                 <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">
                   {product.name}_
                 </h1>
              </div>
              
              <div className="flex items-center gap-6 mt-6">
                <p className="text-4xl font-black italic tracking-tight text-gray-900 tabular-nums">
                  R$ {product.price?.toFixed(2)}
                </p>
                {product.stock > 0 ? (
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                    Em Stock: {product.stock}
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                    Sold Out_
                  </span>
                )}
              </div>

              <div className="mt-10 border-t border-gray-100 pt-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">The Narrative_</h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {product.stock > 0 && (
                <div className="mt-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quantidade_</label>
                    <select 
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-xs font-black outline-none focus:border-gray-900 appearance-none cursor-pointer"
                    >
                      {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={() => addToCart(product, quantity)}
                    className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-8 py-5 text-[10px] font-black uppercase tracking-[0.4em] text-white hover:bg-gray-800 transition-all shadow-2xl active:scale-[0.98]"
                  >
                    Add {quantity > 1 ? `(${quantity})` : ''} to Bag_
                  </button>

                  {/* CÁLCULO DE FRETE INTEGRADO AQUI */}
                  <ShippingCalculator /> 
                </div>
              )}

              {product.stock <= 0 && (
                <div className="mt-10 bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Item indisponível no momento_
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEÇÃO DE ESPECIFICAÇÕES */}
        {specsTabs.length > 0 && (
          <section className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8 border-t border-gray-100">
            <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
              <TabGroup>
                <TabList className="flex space-x-12 border-b border-gray-200 overflow-x-auto scrollbar-hide">
                  {specsTabs.map((tab: any, idx: number) => (
                    <Tab
                      key={idx}
                      className="whitespace-nowrap border-b-2 border-transparent py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 outline-none hover:text-gray-900 data-[selected]:border-gray-900 data-[selected]:text-gray-900 transition-all cursor-pointer"
                    >
                      {tab.name}
                    </Tab>
                  ))}
                </TabList>

                <TabPanels className="mt-16">
                  {specsTabs.map((tab: any, idx: number) => (
                    <TabPanel key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
                      <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 items-center">
                        <div className="space-y-6">
                          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">
                            {tab.title || tab.name}_
                          </h3>
                          <p className="text-sm text-gray-500 leading-relaxed font-medium whitespace-pre-line">
                            {tab.description}
                          </p>
                        </div>
                        {tab.image && (
                          <div className="mt-10 lg:mt-0 aspect-video overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-xl">
                            <img 
                              src={tab.image} 
                              alt={tab.title} 
                              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
                            />
                          </div>
                        )}
                      </div>
                    </TabPanel>
                  ))}
                </TabPanels>
              </TabGroup>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}