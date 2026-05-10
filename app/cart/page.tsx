'use client'

import { useCart } from '../../lib/CartContext' // Ajustado: ../../
import Header from '../../components/Header'    // Ajustado: ../../
import Footer from '../../components/Footer'    // Ajustado: ../../
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart()

  return (
    <div className="bg-white min-h-screen">
      <Header isAbsolute={false} />
      
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 mb-12">
          Sua Bolsa_
        </h1>

        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          <section className="lg:col-span-7">
            {cart.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-gray-400 uppercase font-bold tracking-widest">Sua bolsa está vazia.</p>
                <a href="/#shop" className="mt-4 inline-block text-xs font-black uppercase underline tracking-widest">Continuar Comprando</a>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 border-t border-b border-gray-100">
                {cart.map((product: any) => ( // Adicionado :any para o TS não reclamar
                  <li key={product.id} className="flex py-10">
                    <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="ml-6 flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-black uppercase italic text-gray-900">{product.name}</h3>
                        <p className="text-lg font-black tabular-nums">R$ {product.price}</p>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button onClick={() => updateQuantity(product.id, -1)} className="p-2 hover:bg-gray-50"><MinusIcon className="w-4 h-4"/></button>
                          <span className="px-4 font-bold text-sm">{product.quantity}</span>
                          <button onClick={() => updateQuantity(product.id, 1)} className="p-2 hover:bg-gray-50"><PlusIcon className="w-4 h-4"/></button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(product.id)}
                          className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
                        >
                          Remover Item
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-16 lg:col-span-5 lg:mt-0 p-8 bg-gray-50 rounded-2xl">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Resumo do Pedido_</h2>
            <div className="flow-root">
              <dl className="-my-4 divide-y divide-gray-200 text-sm">
                <div className="flex items-center justify-between py-4">
                  <dt className="text-gray-600 font-medium uppercase tracking-widest text-[10px]">Subtotal</dt>
                  <dd className="font-bold text-gray-900">R$ {cartTotal.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between py-6">
                  <dt className="text-base font-black uppercase italic text-gray-900">Total</dt>
                  <dd className="text-xl font-black text-gray-900">R$ {cartTotal.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
            <a href="/checkout" className="mt-10 block w-full bg-gray-900 py-5 text-center text-xs font-black uppercase tracking-[0.3em] text-white hover:bg-gray-800 transition-all shadow-2xl rounded-md">
              Finalizar Pedido
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}