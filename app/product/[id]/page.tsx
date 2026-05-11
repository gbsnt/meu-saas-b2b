'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '../../../lib/supabase'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { useCart } from '../../../components/CartContext' 

// COMPONENTES
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import Breadcrumb from '../../../components/Breadcrumb'

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { cart, addToCart, setIsCartOpen } = useCart() 
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // ESTADO DE QUANTIDADE LOCAL
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('is_active', true) // Só traz se estiver ativo
          .single()
        
        if (error || !data) {
          setProduct(null) // Define como null se estiver inativo ou não existir
        } else {
          setProduct(data)
        }
      } catch (err) {
        console.error("Erro:", err)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id])

  if (loading) return <div className="h-screen flex items-center justify-center text-xs uppercase tracking-widest text-gray-400 font-bold animate-pulse">Loading_</div>
  if (!product) return <div className="h-screen flex items-center justify-center text-xs uppercase tracking-widest text-gray-400 font-bold">Product not found.</div>

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
              { name: product.category || 'Shop', href: `/category/${product.category}` },
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
              <h1 className="text-4xl font-black italic tracking-tight text-gray-900 uppercase">
                {product.name}_
              </h1>
              
              <div className="flex items-center gap-4 mt-4">
                <p className="text-3xl font-black italic tracking-tight text-gray-900 tabular-nums">
                  R$ {product.price}
                </p>
                {/* SELO DE ESTOQUE */}
                {product.stock > 0 ? (
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded">
                    {product.stock} disponíveis
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                    Esgotado_
                  </span>
                )}
              </div>

              <div className="mt-8 border-t border-gray-100 pt-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">The Story_</h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* CONTROLE DE QUANTIDADE E BOTÃO */}
              {product.stock > 0 && (
                <div className="mt-10 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quantidade:</label>
                    <select 
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="bg-gray-50 border border-gray-200 rounded px-4 py-2 text-xs font-bold outline-none focus:border-gray-900 appearance-none cursor-pointer"
                    >
                      {/* Cria opções até o limite do estoque (máximo 10) */}
                      {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button 
                disabled={product.stock <= 0}
                onClick={() => {
                  addToCart(product, quantity);
                }}
                className={`mt-6 flex w-full items-center justify-center rounded-md px-8 py-5 text-xs font-black uppercase tracking-[0.3em] transition-all shadow-2xl 
                  ${product.stock > 0 
                    ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
              >
                {product.stock > 0 ? `Add ${quantity > 1 ? quantity : ''} to Bag` : 'Sold Out_'}
              </button>
            </div>
          </div>
        </div>

        {/* SEÇÃO DE ESPECIFICAÇÕES */}
        {specsTabs.length > 0 && (
          <section aria-labelledby="features-heading" className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8 border-t border-gray-100">
            <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
              
              {(product.features_title || product.features_description) && (
                <div className="max-w-3xl mb-16">
                  {product.features_title && (
                    <h2 id="features-heading" className="text-4xl font-black italic tracking-tight text-gray-900 uppercase">
                      {product.features_title}
                    </h2>
                  )}
                  {product.features_description && (
                    <p className="mt-4 text-gray-500 font-medium leading-relaxed whitespace-pre-line">
                      {product.features_description}
                    </p>
                  )}
                </div>
              )}

              <TabGroup>
                <div className="-mx-4 flex overflow-x-auto sm:mx-0">
                  <div className="flex-auto border-b border-gray-200 px-4 sm:px-0">
                    <TabList className="-mb-px flex space-x-10">
                      {specsTabs.map((tab: any, idx: number) => (
                        <Tab
                          key={idx}
                          className="whitespace-nowrap border-b-2 border-transparent py-6 text-xs font-black uppercase tracking-widest text-gray-400 outline-none hover:border-gray-900 hover:text-gray-900 data-[selected]:border-gray-900 data-[selected]:text-gray-900 transition-all cursor-pointer"
                        >
                          {tab.name}
                        </Tab>
                      ))}
                    </TabList>
                  </div>
                </div>

                <TabPanels as="div" className="mt-10">
                  {specsTabs.map((tab: any, idx: number) => {
                    const hasText = tab.title || tab.description;
                    const hasImage = tab.image;

                    return (
                      <TabPanel key={idx} className="space-y-16 pt-10 lg:pt-16 outline-none">
                        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
                          {hasText && (
                            <div className={`mt-6 lg:mt-0 ${hasImage ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
                              {tab.title && (
                                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">
                                  {tab.title}
                                </h3>
                              )}
                              {tab.description && (
                                <p className="mt-2 text-sm text-gray-500 leading-relaxed font-medium whitespace-pre-line">
                                  {tab.description}
                                </p>
                              )}
                            </div>
                          )}
                          {hasImage && (
                            <div className={`${hasText ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                              <div className="aspect-[5/2] overflow-hidden rounded-lg bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center">
                                <img 
                                  src={tab.image} 
                                  alt={tab.title || product.name} 
                                  className="size-full object-cover grayscale hover:grayscale-0 transition-all duration-700 cursor-crosshair" 
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </TabPanel>
                    );
                  })}
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