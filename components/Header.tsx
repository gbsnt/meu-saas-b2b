'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { 
  MagnifyingGlassIcon, 
  ShoppingBagIcon, 
  Bars3Icon, 
  XMarkIcon 
} from '@heroicons/react/24/outline'

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  isAbsolute?: boolean;
}

export default function Header({ cartCount, onOpenCart, isAbsolute = false }: HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [categories, setCategories] = useState<any[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Sincroniza o input com o que está na URL (caso o usuário dê F5)
  useEffect(() => {
    const query = searchParams.get('search')
    if (query) setSearchQuery(query)
  }, [searchParams])

  // 2. Busca categorias para o menu
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('name').order('name')
      setCategories(data || [])
    }
    loadCategories()
  }, [])

  // 3. Função de Disparo da Pesquisa
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Normalizamos a URL para evitar erros de acentuação no envio
    const term = searchQuery.trim()
    if (term) {
      router.push(`/?search=${encodeURIComponent(term)}`)
    } else {
      router.push('/')
    }
    setIsMenuOpen(false) // Fecha o menu mobile se estiver aberto
  }

  return (
    <header className={`${isAbsolute ? 'absolute inset-x-0 top-0 z-50' : 'relative bg-white border-b border-gray-100'} transition-all duration-300`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* LOGO */}
          <div className="flex flex-shrink-0">
            <a href="/" className="text-2xl font-black italic tracking-tighter text-gray-900 hover:opacity-70 transition-opacity">
              STUDIO_
            </a>
          </div>

          {/* NAVEGAÇÃO DESKTOP */}
          <div className="hidden lg:flex lg:items-center lg:gap-x-8">
            {categories.map((category) => (
              <a
                key={category.name}
                href={`/category/${encodeURIComponent(category.name)}`}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors"
              >
                {category.name}
              </a>
            ))}
          </div>

          {/* BARRA DE PESQUISA + ÍCONES */}
          <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
            
            {/* INPUT DE BUSCA */}
            <form onSubmit={handleSearch} className="relative flex items-center group">
              <input
                type="text"
                placeholder="PROCURAR_"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-24 sm:w-40 border-b border-gray-200 bg-transparent py-1 text-[10px] font-black uppercase tracking-widest outline-none focus:w-48 sm:focus:w-64 focus:border-gray-900 transition-all duration-500 placeholder:text-gray-300"
              />
              <button type="submit" className="ml-2 group-hover:scale-110 transition-transform">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-900" />
              </button>
            </form>

            {/* CARRINHO */}
            <button onClick={onOpenCart} className="group relative p-2">
              <ShoppingBagIcon className="h-5 w-5 text-gray-900 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[8px] font-black text-white italic">
                  {cartCount}
                </span>
              )}
            </button>

            {/* MENU MOBILE BOTÃO */}
            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <XMarkIcon className="h-6 w-6 text-gray-900" /> : <Bars3Icon className="h-6 w-6 text-gray-900" />}
            </button>
          </div>
        </div>

        {/* MOBILE OVERLAY */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-8 space-y-6 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-4 px-2">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Categorias_</p>
              {categories.map((category) => (
                <a
                  key={category.name}
                  href={`/category/${encodeURIComponent(category.name)}`}
                  className="block text-sm font-black uppercase tracking-widest text-gray-600 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}