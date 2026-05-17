'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number; 
  // 📦 ADICIONADO: As medidas essenciais para o frete real
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  shippingCost: number | null;
  setShippingCost: (value: number | null) => void;
  finalTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// 🧹 MUDANÇA: Atualizamos a chave (de v3 para v4) para limpar o carrinho antigo
// que estava salvo no seu navegador sem as medidas do Supabase.
const STORAGE_KEY = 'studio_cart_v4' 

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY)
    if (savedCart) {
      try { 
        setCart(JSON.parse(savedCart)) 
      } catch (e) { 
        setCart([]) 
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  const addToCart = (product: any, quantityToAdd: number = 1) => {
    const safeStock = product.stock ?? 0;
    
    setCart((prev: CartItem[]) => {
      const existing = prev.find((item) => item.id === product.id)
      const currentQty = existing ? existing.quantity : 0
      const newTotalQty = currentQty + quantityToAdd

      if (newTotalQty > safeStock) {
        alert(`Estoque insuficiente!`)
        return prev
      }

      if (existing) {
        return prev.map((item) => 
          item.id === product.id ? { ...item, quantity: newTotalQty } : item
        )
      }
      
      // Como o spread operator (...product) copia tudo que vem da página do produto,
      // as medidas de weight, width, etc., agora entram direto aqui!
      return [...prev, { ...product, quantity: quantityToAdd, stock: safeStock }]
    })
    setIsCartOpen(true)
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev: CartItem[]) => prev.map((item: CartItem) => {
      if (item.id === id) {
        const newQty = item.quantity + delta
        if (newQty < 1 || newQty > (item.stock ?? 999)) return item
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const removeFromCart = (id: string) => {
    setCart((prev: CartItem[]) => {
      const newCart = prev.filter((item) => item.id !== id)
      if (newCart.length === 0) setShippingCost(null)
      return newCart
    })
  }

  const clearCart = () => {
    setCart([])
    setShippingCost(null)
  }
  
  const cartTotal = cart.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0)
  const finalTotal = cartTotal + (shippingCost ?? 0)

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, 
      cartTotal, shippingCost, setShippingCost, finalTotal,
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