import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CartProvider } from '../components/CartContext' 
import CartSidebar from '../components/CartSidebar' 

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'STUDIO_ | Minimalist Fashion',
  description: 'Design minimalista. O fim do excesso, o início da durabilidade.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br" className="scroll-smooth">
      <body className={inter.className}>
        <CartProvider>
          <CartSidebar /> 
          {children}
        </CartProvider>
      </body>
    </html>
  )
}