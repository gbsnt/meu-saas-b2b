import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CartProvider } from '../lib/CartContext' // Importando o contexto que criamos

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
        {/* O CartProvider envolve toda a aplicação */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}