'use client'

import { Suspense } from 'react' // 1. Importar Suspense
import { useCart } from '../../components/CartContext'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'

// 2. Criamos um componente interno para a lógica do Carrinho
function CartContent() {
  const { cart, removeFromCart, updateQuantity, cartTotal, setIsCartOpen } = useCart()

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header 
        isAbsolute={false} 
        cartCount={cart.length} 
        onOpenCart={() => setIsCartOpen(true)} 
      />
      
      <main className="flex-1 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 mb-12">
          Sua Bolsa_
        </h1>

        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          <section className="lg:col-span-7">
            {cart.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-gray-400 uppercase font-bold tracking-widest text-xs">Sua bolsa está vazia.</p>
                <a href="/#shop" className="mt-4 inline-block text-[10px] font-black uppercase underline tracking-widest">Continuar Comprando</a>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 border-t border-b border-gray-100">
                {cart.map((product: any) => (
                  <li key={product.id} className="flex py-10">
                    <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100 shadow-sm">
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="ml-6 flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-black uppercase italic text-gray-900 tracking-tight">{product.name}</h3>
                        <p className="text-sm font-black tabular-nums">R$ {product.price}</p>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-md bg-white">
                          <button onClick={() => updateQuantity(product.id, -1)} className="p-2 hover:bg-gray-50 transition-colors"><MinusIcon className="w-3 h-3"/></button>
                          <span className="px-3 font-bold text-xs tabular-nums">{product.quantity}</span>
                          <button onClick={() => updateQuantity(product.id, 1)} className="p-2 hover:bg-gray-50 transition-colors"><PlusIcon className="w-3 h-3"/></button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(product.id)}
                          className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-red-600 transition-colors"
                        >
                          Remover_
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-16 lg:col-span-5 lg:mt-0 p-8 bg-gray-50 rounded-2xl border border-gray-100">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 border-b border-gray-200 pb-4">Resumo do Pedido_</h2>
            <div className="flow-root">
              <dl className="-my-4 divide-y divide-gray-200 text-sm">
                <div className="flex items-center justify-between py-4">
                  <dt className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">Subtotal</dt>
                  <dd className="font-black text-gray-900 tabular-nums">R$ {cartTotal.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between py-6">
                  <dt className="text-sm font-black uppercase italic text-gray-900">Total Final</dt>
                  <dd className="text-2xl font-black text-gray-900 tabular-nums italic">R$ {cartTotal.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
            <button className="mt-10 block w-full bg-gray-900 py-5 text-center text-xs font-black uppercase tracking-[0.3em] text-white hover:bg-gray-800 transition-all shadow-2xl rounded-md active:scale-95">
              Ir para o Pagamento
            </button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// 3. O export default principal envolve tudo em Suspense
export default function CartPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400 animate-pulse">Sincronizando Bolsa_</div>}>
      <CartContent />
    </Suspense>
  )
}