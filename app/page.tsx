'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'

// IMPORTANDO OS COMPONENTES
import Header from '../components/Header'
import Footer from '../components/Footer'

// --- DADOS DO MEGABANNER ROTATIVO (PAISAGENS) ---
const banners = [
  {
    id: 1,
    title: "A Forma do Essencial_",
    subtitle: "Inspirado na natureza. O fim do excesso, o início da durabilidade.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2850&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Texturas Premium_",
    subtitle: "Resistência e conforto extremo para qualquer ambiente.",
    image: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=2850&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Espaço & Silêncio_",
    subtitle: "Redescubra a beleza nas formas fluidas e cores neutras.",
    image: "https://images.unsplash.com/photo-1439405326854-014607f694d7?q=80&w=2850&auto=format&fit=crop"
  }
]

function Storefront() {
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get('search')

  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([]) 
  const [isCartOpen, setIsCartOpen] = useState(false) 
  const [loading, setLoading] = useState(true)

  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data } = await supabase.from('products').select('*')
      let fetchedProducts = data || []

      if (urlSearch) {
        const term = urlSearch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        
        fetchedProducts = fetchedProducts.filter(product => {
          const name = (product.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          const desc = (product.description || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          return name.includes(term) || desc.includes(term)
        })
      }

      setProducts(fetchedProducts)
      setLoading(false)
    }
    loadData()
  }, [urlSearch])

  if (loading) return <div className="h-screen flex items-center justify-center text-xs uppercase tracking-widest text-gray-400">Loading_</div>

  return (
    <div className="bg-white">
      {/* HEADER COMPONENTIZADO */}
      <Header 
        cartCount={cart.length} 
        onOpenCart={() => setIsCartOpen(true)} 
        isAbsolute={false} 
      />

      {/* MEGABANNER ROTATIVO (CAROUSEL) */}
      {!urlSearch && (
        <div className="relative bg-gray-900 h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          {banners.map((banner, index) => (
            <div 
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="absolute inset-0">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="h-full w-full object-cover object-center opacity-80"
                />
                <div className="absolute inset-0 bg-gray-900/40 mix-blend-multiply" />
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 lg:px-8 max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl uppercase italic transform transition-transform duration-1000 translate-y-0">
                  {banner.title}
                </h1>
                <p className="mt-6 text-lg font-medium text-gray-200 sm:text-xl">
                  {banner.subtitle}
                </p>
                <div className="mt-10">
                  <a href="#shop" className="rounded-md bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-gray-900 hover:bg-gray-100 transition-all shadow-2xl">
                    Explorar Coleção
                  </a>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* PRODUCT LIST */}
      <main id="shop" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 pb-4 mb-10 flex justify-between items-end">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase italic">
            {urlSearch ? `Resultados para "${urlSearch}"_` : 'Latest Pieces_'}
          </h2>
          {urlSearch && (
            <a href="/" className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors">
              Limpar Filtro X
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="group relative">
                <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 lg:h-80 group-hover:opacity-75 transition-opacity">
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover object-center" />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase">
                      <a href={`/product/${product.id}`}>
                        <span className="absolute inset-0" aria-hidden="true" />
                        {product.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">{product.description}</p>
                  </div>
                  <p className="text-sm font-black text-gray-900 italic tabular-nums">R$ {product.price}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-32 border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">Nenhum produto encontrado para "{urlSearch}".</p>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER COMPONENTIZADO */}
      <Footer />
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-xs uppercase tracking-widest text-gray-400">Loading...</div>}>
      <Storefront />
    </Suspense>
  )
}