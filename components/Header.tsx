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

  useEffect(() => {
    const query = searchParams.get('search')
    if (query) setSearchQuery(query)
  }, [searchParams])

  useEffect(() => {
    async function loadCategories() {
      // 1. Busca Categorias respeitando a ordem do Drag and Drop
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, order_index')
        .order('order_index', { ascending: true })

      // 2. Busca APENAS os IDs/Nomes de categorias que possuem produtos ATIVOS
      const { data: activeProducts } = await supabase
        .from('products')
        .select('category_id, category')
        .eq('is_active', true) // Filtro crucial: ignora produtos inativos

      if (cats && activeProducts) {
        // Cria um "catálogo" rápido do que está em uso
        const activeIds = new Set(activeProducts.map(p => p.category_id))
        const activeNames = new Set(activeProducts.map(p => p.category))

        // 3. Filtra as categorias vazias
        const populatedCategories = cats.filter(c => activeIds.has(c.id) || activeNames.has(c.name))
        
        setCategories(populatedCategories)
      }
    }
    loadCategories()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const term = searchQuery.trim()
    if (term) {
      router.push(`/?search=${encodeURIComponent(term)}`)
    } else {
      router.push('/')
    }
    setIsMenuOpen(false) 
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

          {/* NAVEGAÇÃO DESKTOP (CATEGORIAS) */}
          <div className="hidden lg:flex lg:items-center lg:gap-x-8">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`/category/${encodeURIComponent(category.name)}`}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors"
              >
                {category.name}
              </a>
            ))}
          </div>

          {/* ÍCONES LADO DIREITO */}
          <div className="flex items-center justify-end gap-2 sm:gap-6">
            
            {/* BUSCA DESKTOP (ESCONDIDA NO MOBILE) */}
            <form onSubmit={handleSearch} className="hidden lg:relative lg:flex items-center group">
              <input
                type="text"
                placeholder="PROCURAR_"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 border-b border-gray-200 bg-transparent py-1 text-[10px] font-black uppercase tracking-widest outline-none focus:w-64 focus:border-gray-900 transition-all duration-500"
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

            {/* BOTÃO MENU MOBILE (HAMBÚRGUER) */}
            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-900" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-900" />
              )}
            </button>
          </div>
        </div>

        {/* MENU MOBILE (OVERLAY) */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-10 space-y-10 animate-in slide-in-from-top-2 duration-300 bg-white absolute inset-x-0 z-40 px-6 shadow-xl">
            
            {/* BUSCA DENTRO DO MENU MOBILE (IDÊNTICA À WEB) */}
            <div className="space-y-4">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Search_</p>
              <form onSubmit={handleSearch} className="relative flex items-center w-full">
                <input
                  type="text"
                  placeholder="O QUE VOCÊ PROCURA?_"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-b-2 border-gray-100 bg-transparent py-3 text-[11px] font-black uppercase tracking-widest outline-none focus:border-gray-900 transition-all placeholder:text-gray-200"
                />
                <button type="submit" className="absolute right-0 p-2">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </button>
              </form>
            </div>

            {/* CATEGORIAS MOBILE */}
            <div className="space-y-6">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Categorias_</p>
              <div className="grid grid-cols-1 gap-y-4">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`/category/${encodeURIComponent(category.name)}`}
                    className="text-lg font-black uppercase italic tracking-tighter text-gray-900 hover:text-gray-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}