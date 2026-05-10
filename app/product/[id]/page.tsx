'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '../../../lib/supabase'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { useCart } from '../../../lib/CartContext' // IMPORTANDO O MOTOR DE VENDAS

// COMPONENTES DO NOSSO LEGO
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import Breadcrumb from '../../../components/Breadcrumb'

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { cart, addToCart } = useCart() // ACESSANDO O CARRINHO GLOBAL
  
  // Estados do Produto
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Controle da Gaveta (UI)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Busca o produto no Supabase
  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      setProduct(data)
      setLoading(false)
    }
    loadProduct()
  }, [id])

  // DADOS DAS ABAS TÉCNICAS
  const specsTabs = [
    {
      name: 'Design',
      title: 'Minimalismo Arquitetônico',
      description: 'O sistema modular STUDIO_ oferece opções infinitas para organizar seus itens essenciais. Mantendo tudo ao alcance e em seu devido lugar, enquanto eleva a estética do seu espaço pessoal.',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format&fit=crop'
    },
    {
      name: 'Material',
      title: 'Fibras de Alta Performance',
      description: 'Utilizamos apenas materiais de base rica, como linho europeu e algodão Pima de alta densidade. Cada peça é lixada à mão e acabada com óleos naturais para um toque orgânico único.',
      image: 'https://images.unsplash.com/photo-1558273109-28253922244a?q=80&w=2000&auto=format&fit=crop'
    },
    {
      name: 'Considerations',
      title: 'Feito para a Vida Real',
      description: 'Nossos clientes utilizam as peças STUDIO_ em diversas rotinas diárias. Aproveite a versatilidade no trabalho, em casa ou em viagens. Mal podemos esperar para ver como você as integrará ao seu lifestyle.',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop'
    },
    {
      name: 'Included',
      title: 'A Experiência Completa',
      description: 'O conjunto básico inclui a peça principal, nossa Dust Bag exclusiva de algodão orgânico e um certificado de autenticidade numerado, garantindo a exclusividade da sua curadoria.',
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2000&auto=format&fit=crop'
    }
  ]

  if (loading) return <div className="h-screen flex items-center justify-center text-xs uppercase tracking-widest text-gray-400 font-bold">Loading_</div>
  if (!product) return <div className="h-screen flex items-center justify-center text-xs uppercase tracking-widest text-gray-400 font-bold">Product not found.</div>

  return (
    <div className="bg-white">
      {/* 1. HEADER CONECTADO AO CARRINHO REAL */}
      <Header 
         isAbsolute={false}
         cartCount={cart.length} 
        onOpenCart={() => setIsCartOpen(true)} 
        />

      <main>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          
          <Breadcrumb 
            items={[
              { name: product.category || 'Shop', href: `/category/${product.category}` },
              { name: product.name }
            ]} 
          />

          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12 mt-8">
            <div className="aspect-square w-full overflow-hidden rounded-xl shadow-2xl bg-gray-50">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="h-full w-full object-cover object-center" 
              />
            </div>

            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              <h1 className="text-4xl font-black italic tracking-tight text-gray-900 uppercase">
                {product.name}_
              </h1>
              <p className="mt-4 text-3xl font-black italic tracking-tight text-gray-900">
                R$ {product.price}
              </p>

              <div className="mt-8 border-t border-gray-100 pt-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">The Story_</h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* BOTÃO COM LÓGICA DE VENDA */}
              <button 
                onClick={() => {
                  addToCart(product);
                  setIsCartOpen(true); // Abre a gaveta de UI (que criaremos a seguir)
                }}
                className="mt-10 flex w-full items-center justify-center rounded-md bg-gray-900 px-8 py-5 text-xs font-black uppercase tracking-[0.3em] text-white hover:bg-gray-800 transition-all shadow-2xl active:scale-[0.98]"
              >
                Add to Bag
              </button>
            </div>
          </div>
        </div>

        <section aria-labelledby="features-heading" className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8 border-t border-gray-100">
          <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
            <div className="max-w-3xl">
              <h2 id="features-heading" className="text-4xl font-black italic tracking-tight text-gray-900 uppercase">
                Technical Specifications_
              </h2>
              <p className="mt-4 text-gray-500 font-medium leading-relaxed">
                Nossa engenharia de produto foca no equilíbrio entre forma e função. Cada detalhe é projetado para durar e evoluir com você através dos anos.
              </p>
            </div>

            <TabGroup className="mt-16">
              <div className="-mx-4 flex overflow-x-auto sm:mx-0">
                <div className="flex-auto border-b border-gray-200 px-4 sm:px-0">
                  <TabList className="-mb-px flex space-x-10">
                    {specsTabs.map((tab) => (
                      <Tab
                        key={tab.name}
                        className="whitespace-nowrap border-b-2 border-transparent py-6 text-xs font-black uppercase tracking-widest text-gray-400 outline-none hover:border-gray-900 hover:text-gray-900 data-[selected]:border-gray-900 data-[selected]:text-gray-900 transition-all"
                      >
                        {tab.name}
                      </Tab>
                    ))}
                  </TabList>
                </div>
              </div>

              <TabPanels as="div" className="mt-10">
                {specsTabs.map((tab) => (
                  <TabPanel key={tab.name} className="space-y-16 pt-10 lg:pt-16 outline-none">
                    <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
                      <div className="mt-6 lg:col-span-5 lg:mt-0">
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">
                          {tab.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 leading-relaxed font-medium">
                          {tab.description}
                        </p>
                      </div>
                      
                      <div className="lg:col-span-7">
                        <div className="aspect-[5/2] overflow-hidden rounded-lg bg-gray-100 shadow-lg">
                          <img 
                            src={tab.image} 
                            alt={tab.title} 
                            className="size-full object-cover grayscale hover:grayscale-0 transition-all duration-700 cursor-crosshair" 
                          />
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}