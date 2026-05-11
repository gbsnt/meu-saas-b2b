'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number; 
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// CHAVE DE VERSÃO: Alterar para v2 limpa o cache antigo do navegador do cliente e resolve o erro do "estoque 1"
const STORAGE_KEY = 'studio_cart_v2'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // 1. Carregar carrinho com segurança
  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY)
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error("Erro ao parsear carrinho antigo:", e)
        setCart([])
      }
    }
    setIsLoaded(true)
  }, [])

  // 2. Salvar sempre que o carrinho mudar
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  const addToCart = (product: any, quantityToAdd: number = 1) => {
    // Garantir que o estoque é um número válido
    const safeStock = product.stock ?? 0;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      const currentQty = existing ? existing.quantity : 0
      const newTotalQty = currentQty + quantityToAdd

      // Validação de Estoque
      if (newTotalQty > safeStock) {
        alert(`Limite de estoque! Temos apenas ${safeStock} unidades disponíveis.`)
        return prev
      }

      if (existing) {
        return prev.map((item) =>
          item.id === product.id 
            ? { ...item, quantity: newTotalQty, stock: safeStock } 
            : item
        )
      }

      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        image_url: product.image_url, 
        stock: safeStock, 
        quantity: quantityToAdd 
      }]
    })
    
    setIsCartOpen(true)
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta
        
        if (newQty < 1) return item 

        // Proteção: Se o estoque estiver faltando por algum erro, não travar o cliente em 1
        const availableStock = item.stock ?? 999;

        if (newQty > availableStock) {
          alert(`Desculpe, nosso estoque atual para este item é de ${availableStock} unidades.`)
          return item
        }

        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => setCart([])
  
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, 
      isCartOpen, setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}