'use client'

import { useCart } from '../../components/CartContext'
import Link from 'next/link'
import { ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline'

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart()

  // Se o carrinho estiver vazio, sugere voltar às compras
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-gray-900">Sua bolsa está vazia_</h1>
        <Link href="/#shop" className="text-xs font-bold uppercase tracking-[0.2em] underline text-gray-500 hover:text-gray-900 transition-colors">
          Voltar para a loja
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* HEADER SIMPLIFICADO DO CHECKOUT */}
        <div className="flex items-center justify-between mb-16 border-b border-gray-100 pb-8">
          <Link href="/" className="font-bold text-2xl uppercase italic tracking-tighter text-gray-900">
            STUDIO_
          </Link>
          <div className="flex items-center text-gray-400 gap-2">
            <LockClosedIcon className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Ambiente Seguro</span>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-20">
          
          {/* COLUNA 1: DADOS DO CLIENTE */}
          <section>
            <form className="space-y-10">
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-8 border-l-2 border-gray-900 pl-4">
                  01. Informações de Entrega_
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">E-mail</label>
                    <input type="email" required className="w-full border-b border-gray-200 py-3 outline-none focus:border-gray-900 transition-all text-sm font-medium" placeholder="seu@email.com" />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Nome</label>
                      <input type="text" required className="w-full border-b border-gray-200 py-3 outline-none focus:border-gray-900 transition-all text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Sobrenome</label>
                      <input type="text" required className="w-full border-b border-gray-200 py-3 outline-none focus:border-gray-900 transition-all text-sm font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Endereço Completo</label>
                    <input type="text" required className="w-full border-b border-gray-200 py-3 outline-none focus:border-gray-900 transition-all text-sm font-medium" placeholder="Rua, número e complemento" />
                  </div>

                  <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Cidade</label>
                      <input type="text" required className="w-full border-b border-gray-200 py-3 outline-none focus:border-gray-900 transition-all text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">CEP</label>
                      <input type="text" required className="w-full border-b border-gray-200 py-3 outline-none focus:border-gray-900 transition-all text-sm font-medium" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-8 border-l-2 border-gray-900 pl-4">
                  02. Método de Pagamento_
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-6 border-2 border-gray-900 rounded-lg bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full border-4 border-gray-900 mr-3" />
                      <span className="text-xs font-black uppercase tracking-widest text-gray-900">Cartão / PIX / Boleto</span>
                    </div>
                    <ShieldCheckIcon className="h-6 w-6 text-gray-900" />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-gray-900 py-6 text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-gray-800 shadow-2xl transition-all active:scale-[0.98]"
              >
                Finalizar Compra R$ {cartTotal.toFixed(2)}
              </button>
            </form>
          </section>

          {/* COLUNA 2: RESUMO DO PEDIDO (STICKY) */}
          <section className="mt-16 lg:mt-0">
            <div className="lg:sticky lg:top-10 bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Itens na Bolsa_</h2>
              
              <ul className="divide-y divide-gray-200 mb-8 max-h-[400px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <li key={item.id} className="flex py-6 first:pt-0">
                    <img src={item.image_url} className="h-20 w-20 object-cover rounded-md border border-gray-200" alt={item.name} />
                    <div className="ml-4 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between text-xs font-black uppercase italic text-gray-900">
                        <span>{item.name}</span>
                        <span>R$ {item.price}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Quantidade: {item.quantity}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-4 border-t border-gray-200 pt-8">
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-gray-900">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                  <span>Frete</span>
                  <span className="text-green-600 font-black tracking-tighter">Grátis_</span>
                </div>
                <div className="flex justify-between text-xl font-black uppercase italic text-gray-900 pt-4">
                  <span>Total</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-[10px] text-center text-gray-400 font-medium leading-relaxed">
                  Ao finalizar a compra, você concorda com nossos <br />
                  <span className="underline cursor-pointer">Termos de Serviço</span> e <span className="underline cursor-pointer">Política de Privacidade</span>.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}