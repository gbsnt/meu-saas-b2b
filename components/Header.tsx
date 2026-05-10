'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ShoppingBagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

// IMPORTAMOS O MOTOR DO CARRINHO E A GAVETA
import { useCart } from '../lib/CartContext'
import CartDrawer from './CartDrawer'

const navigation = [
  { name: 'Men', href: '/category/men' },
  { name: 'Women', href: '/category/women' },
  { name: 'Accessories', href: '/category/accessories' },
  { name: 'New Arrivals', href: '/#shop' },
]

export default function Header({ isAbsolute = false }: { isAbsolute?: boolean }) {
  const router = useRouter()
  const { cart, setIsCartOpen } = useCart() // Agora o Header controla o próprio carrinho
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchVisible, setIsSearchVisible] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchVisible(false)
      setMobileMenuOpen(false)
      router.push(`/?search=${encodeURIComponent(searchQuery)}#shop`)
    }
  }

  return (
    <header className={`${isAbsolute ? 'absolute inset-x-0 top-0 z-50' : 'relative bg-white border-b border-gray-100 z-50'}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        
        {/* LOGO */}
        <div className="flex flex-1">
          <a href="/" className="font-bold text-xl tracking-tight text-gray-900 uppercase italic">STUDIO_</a>
        </div>

        {/* LINKS DESKTOP */}
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="text-sm font-semibold text-gray-900 hover:text-gray-500 transition-colors">
              {item.name}
            </a>
          ))}
        </div>

        {/* GRUPO DA DIREITA */}
        <div className="flex flex-1 justify-end items-center gap-x-6">
          
          {/* BUSCA DESKTOP */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:flex items-center text-gray-400">
            {isSearchVisible && (
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="mr-2 border-b border-gray-300 focus:border-gray-900 outline-none text-sm text-gray-900 bg-transparent pb-1 w-32 transition-all"
                autoFocus
              />
            )}
            <MagnifyingGlassIcon 
              className="size-6 cursor-pointer hover:text-gray-900" 
              onClick={() => setIsSearchVisible(!isSearchVisible)}
            />
          </form>

          {/* BOTÃO DO CARRINHO (AGORA CLICÁVEL EM QUALQUER LUGAR) */}
          <button 
            type="button"
            onClick={() => setIsCartOpen(true)} 
            className="group -m-2 flex items-center p-2 relative text-gray-400 cursor-pointer"
          >
            <ShoppingBagIcon className="h-6 w-6 group-hover:text-gray-900 transition-colors" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                {cart.length}
              </span>
            )}
          </button>

          {/* SANDUÍCHE MOBILE */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <Bars3Icon className="size-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* RENDERIZAR A GAVETA AQUI DENTRO PARA ELA FUNCIONAR SEMPRE */}
      <CartDrawer />

      {/* MENU MOBILE */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-50 pb-6">
            <a href="/" className="font-bold text-xl uppercase italic">STUDIO_</a>
            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-700"><XMarkIcon className="size-6" /></button>
          </div>

          <div className="mt-8">
            <div className="mb-10 sm:hidden">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center text-gray-400">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full border-b border-gray-300 focus:border-gray-900 outline-none text-sm text-gray-900 bg-transparent pb-2 transition-all"
                />
                <button type="submit" className="absolute right-0 bottom-2"><MagnifyingGlassIcon className="size-5" /></button>
              </form>
            </div>

            <div className="space-y-4">
              {navigation.map((item) => (
                <a key={item.name} href={item.href} className="block text-lg font-black uppercase italic tracking-tight text-gray-900 hover:text-gray-500">
                  {item.name}_
                </a>
              ))}
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}