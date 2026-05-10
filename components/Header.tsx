'use client'

import Link from 'next/link'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
// IMPORTANTE: Verifique se o arquivo se chama CartDrawer.tsx (com C e D maiúsculos)
import CartDrawer from './CartDrawer' 

interface HeaderProps {
  isAbsolute?: boolean
  cartCount?: number
  onOpenCart?: () => void
}

export default function Header({ isAbsolute = false, cartCount = 0, onOpenCart }: HeaderProps) {
  return (
    <header className={`${isAbsolute ? 'absolute inset-x-0 top-0 z-50' : 'relative bg-white border-b border-gray-100'}`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between">
        <div className="flex-1">
          <Link href="/" className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">
            STUDIO_
          </Link>
        </div>

        <div className="flex items-center gap-8">
          <Link href="/admin" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900">
            Admin_
          </Link>
          
          <button onClick={onOpenCart} className="group relative flex items-center p-2">
            <ShoppingBagIcon className="h-5 w-5 text-gray-900 group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[8px] font-black text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>
      {/* O CartDrawer fica aqui dentro para funcionar em todas as páginas */}
      <CartDrawer />
    </header>
  )
}