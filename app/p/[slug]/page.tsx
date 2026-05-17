'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { Render } from '@measured/puck'
import { config } from '@/lib/puck.config'
import '@measured/puck/puck.css' // Importa o CSS base do Puck

// Importando o Cabeçalho e Rodapé da sua loja para manter a identidade visual!
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCart } from '@/components/CartContext'

export default function CustomPageViewer({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { cart, setIsCartOpen } = useCart()
  const [pageData, setPageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPage() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('custom_pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single()

        if (data) {
          setPageData(data)
        }
      } catch (err) {
        console.error("Erro ao buscar página:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPage()
  }, [slug])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse bg-white">
        Sincronizando STUDIO_
      </div>
    )
  }

  if (!pageData) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header isAbsolute={false} cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">404_</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Página não encontrada</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* 1. SEU CABEÇALHO PADRÃO */}
      <Header 
         isAbsolute={false}
         cartCount={cart.length} 
         onOpenCart={() => setIsCartOpen(true)} 
      />

      {/* 2. O CONTEÚDO RENDERIZADO PELO PUCK */}
      <main className="flex-1">
        {/* O componente Render lê o JSON e desenha os blocos perfeitamente! */}
        <Render config={config} data={pageData.content} />
      </main>

      {/* 3. SEU RODAPÉ PADRÃO */}
      <Footer />
    </div>
  )
}