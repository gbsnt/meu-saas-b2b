'use client'

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { useCart } from './CartContext'
import Link from 'next/link' // Importação essencial para navegação interna

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart()

  return (
    <Transition show={isCartOpen}>
      <Dialog onClose={() => setIsCartOpen(false)} className="relative z-[100]">
        <TransitionChild
          enter="transition-opacity duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between border-b border-gray-100 pb-6">
                        <DialogTitle className="text-lg font-black uppercase italic tracking-widest text-gray-900">
                          Your Bag_
                        </DialogTitle>
                        <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-900">
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>

                      <div className="mt-8">
                        {cart.length === 0 ? (
                          <div className="text-center py-20 text-gray-400 uppercase text-xs tracking-widest font-bold">
                            Sua bolsa está vazia_
                          </div>
                        ) : (
                          <ul className="divide-y divide-gray-100">
                            {cart.map((product) => (
                              <li key={product.id} className="flex py-6">
                                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="ml-4 flex flex-1 flex-col">
                                  <div className="flex justify-between text-sm font-black uppercase italic text-gray-900">
                                    <h3>{product.name}</h3>
                                    <p className="ml-4 tabular-nums text-xs">R$ {product.price}</p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-xs">
                                    <div className="flex items-center border border-gray-200 rounded">
                                      <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:bg-gray-50 text-gray-500"><MinusIcon className="w-3 h-3"/></button>
                                      <span className="px-3 font-bold">{product.quantity}</span>
                                      <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:bg-gray-50 text-gray-500"><PlusIcon className="w-3 h-3"/></button>
                                    </div>
                                    <button onClick={() => removeFromCart(product.id)} className="font-bold text-gray-400 hover:text-red-600 uppercase tracking-widest transition-colors">
                                      Remover
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 px-4 py-6 sm:px-6 bg-gray-50">
                      <div className="flex justify-between text-base font-black uppercase italic text-gray-900">
                        <p>Subtotal</p>
                        <p>R$ {cartTotal.toFixed(2)}</p>
                      </div>
                      <p className="mt-0.5 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Taxas e frete calculados no checkout.</p>
                      <div className="mt-6">
                        {/* TROCADO DE <a> PARA <Link> */}
                        <Link
                          href="/checkout"
                          onClick={() => setIsCartOpen(false)}
                          className="flex items-center justify-center rounded-md bg-gray-900 px-6 py-5 text-xs font-black uppercase tracking-[0.3em] text-white shadow-xl hover:bg-gray-800 transition-all active:scale-95 text-center"
                        >
                          Checkout Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}