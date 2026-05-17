'use client'

import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useCart } from '../../components/CartContext'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const { cart, setIsCartOpen } = useCart()

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* 🚀 Injetado as propriedades obrigatórias que o TypeScript pediu */}
      <Header 
         isAbsolute={false}
         cartCount={cart.length} 
         onOpenCart={() => setIsCartOpen(true)} 
      />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}