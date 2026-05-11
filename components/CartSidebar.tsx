'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useCart } from './CartContext'

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart()

  return (
    <Transition.Root show={isCartOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={setIsCartOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    <div className="flex-1 overflow-y-auto px-6 py-8">
                      <div className="flex items-start justify-between border-b border-gray-100 pb-6">
                        <Dialog.Title className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">
                          Sua Bolsa_
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-900 transition-colors"
                            onClick={() => setIsCartOpen(false)}
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        {cart.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                              A bolsa está vazia_
                            </p>
                          </div>
                        ) : (
                          <ul role="list" className="divide-y divide-gray-100">
                            {cart.map((product) => (
                              <li key={product.id} className="flex py-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="h-full w-full object-cover object-center"
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-xs font-black uppercase italic tracking-tight text-gray-900">
                                      <h3>{product.name}</h3>
                                      <p className="ml-4">R$ {product.price}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between">
                                    <div className="flex items-center border border-gray-100 rounded bg-gray-50">
                                      <button 
                                        onClick={() => updateQuantity(product.id, -1)}
                                        className="p-1 hover:text-gray-900 text-gray-400"
                                      >
                                        <MinusIcon className="h-3 w-3" />
                                      </button>
                                      <span className="px-2 text-[10px] font-bold">{product.quantity}</span>
                                      <button 
                                        onClick={() => updateQuantity(product.id, 1)}
                                        className="p-1 hover:text-gray-900 text-gray-400"
                                      >
                                        <PlusIcon className="h-3 w-3" />
                                      </button>
                                    </div>

                                    <button
                                      type="button"
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
                      </div>
                    </div>

                    {cart.length > 0 && (
                      <div className="border-t border-gray-100 px-6 py-8 bg-gray-50">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                          <p>Subtotal</p>
                          <p className="text-gray-900 italic">R$ {cartTotal.toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-[9px] text-gray-400 uppercase font-bold tracking-widest">
                          Frete e taxas calculados no checkout.
                        </p>
                        <div className="mt-8">
                          <a
                            href="/checkout"
                            className="flex items-center justify-center rounded-md bg-gray-900 px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-white shadow-2xl hover:bg-gray-800 transition-all active:scale-95"
                          >
                            Finalizar Pedido
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}