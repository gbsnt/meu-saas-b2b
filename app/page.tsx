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
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // 1. Buscamos todos os ativos (para garantir que a busca local seja completa)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        
        if (error) throw error

        let filtered = data || []

        // 2. A PESQUISA INTELIGENTE
        if (urlSearch) {
          const termNorm = normalizeText(urlSearch)
          
          filtered = filtered.filter(product => {
            const nameNorm = normalizeText(product.name || "")
            const descNorm = normalizeText(product.description || "")
            const catNorm = normalizeText(product.category || "")

            // Verifica se o termo existe no nome, descrição ou categoria
            return nameNorm.includes(termNorm) || 
                   descNorm.includes(termNorm) || 
                   catNorm.includes(termNorm)
          })
        }

        setProducts(filtered)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (isMounted) loadData()
  }, [urlSearch, isMounted])

  if (!isMounted || loading) return (
    <div className="h-screen flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">
      Sincronizando STUDIO_
    </div>
  )

  return (
    <div className="bg-white">
      <Header 
        cartCount={cart.length} 
        onOpenCart={() => setIsCartOpen(true)} 
        isAbsolute={false} 
      />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 min-h-screen">
        <div className="border-b border-gray-100 pb-8 mb-12">
          <h2 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">
            {urlSearch ? `Busca: ${urlSearch}_` : 'Full Collection_'}
          </h2>
          {urlSearch && (
            <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Encontrados {products.length} resultados inteligentes
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="group relative flex flex-col">
              <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 group-hover:opacity-80 transition-all duration-700 shadow-sm relative">
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover object-center" />
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
                    {product.category}
                  </p>
                </div>
                <p className="text-xs font-black text-gray-900 tabular-nums italic bg-gray-50 px-2 py-1 rounded">
                  R$ {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-gray-400 uppercase tracking-widest text-[10px] font-black">
              Nenhum resultado para "{urlSearch}"_
            </p>
            <a href="/" className="mt-6 inline-block text-[10px] font-black uppercase border-b-2 border-gray-900 pb-1">
              Ver Catálogo Completo
            </a>
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