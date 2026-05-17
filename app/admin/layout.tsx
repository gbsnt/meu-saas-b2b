'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  Cog6ToothIcon,
  TagIcon, 
  ArrowLeftOnRectangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard_', href: '/admin', icon: HomeIcon },
  { name: 'Produtos_', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Categorias_', href: '/admin/categories', icon: TagIcon },
  { name: 'Páginas_', href: '/admin/pages', icon: DocumentTextIcon },
  { name: 'Clientes_', href: '/admin/customers', icon: UsersIcon },
  { name: 'Configurações_', href: '/admin/settings', icon: Cog6ToothIcon },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isBuilderPage = pathname?.includes('/admin/pages/builder')

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex">
      
      {/* COLUNA 1: SIDEBAR FIXA À ESQUERDA */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 shrink-0 z-20">
        <div className="h-24 flex items-center px-8 border-b border-gray-50 shrink-0">
          <Link href="/" className="group">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900 group-hover:opacity-60 transition-opacity">
              STUDIO_
            </h1>
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] -mt-1 ml-1">Admin Control</p>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = item.href === '/admin' 
              ? pathname === '/admin' 
              : pathname.startsWith(item.href)

            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                  isActive 
                    ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 translate-x-1' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-gray-900'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-50 shrink-0">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="h-4 w-4" />
            Sair da Loja
          </Link>
        </div>
      </div>

      {/* COLUNA 2: CONTEÚDO PRINCIPAL FLUIDO */}
      <div className="flex-1 flex flex-col min-w-0">
        {!isBuilderPage && (
          <header className="h-20 bg-white border-b border-gray-100 flex items-center px-12 justify-between shrink-0 z-10">
             <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
               Painel de Controle v2.0
             </div>
             
             <div className="flex items-center gap-6">
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                 <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                 Database Online
               </div>
               
               <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-black text-white italic">
                 ST
               </div>
             </div>
          </header>
        )}

        {/* 🌟 A MÁGICA ESTÁ AQUI: min-w-0 impede que o main seja empurrado para a direita */}
        <main className={`flex-1 min-w-0 ${isBuilderPage ? 'p-0 h-screen overflow-hidden' : 'px-12 py-10 overflow-y-auto'}`}>
          <div className="w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}