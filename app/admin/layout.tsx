'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Produtos', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Clientes', href: '/admin/customers', icon: UsersIcon },
  { name: 'Configurações', href: '/admin/settings', icon: Cog6ToothIcon },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* MENU LATERAL */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-20 flex items-center px-8 border-b border-gray-100">
          <Link href="/" className="text-xl font-black italic uppercase tracking-tighter text-gray-900">
            STUDIO_
          </Link>
          <span className="ml-2 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">ADMIN</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${
                  isActive 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center px-8 justify-end">
           <div className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
             <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
             Sistema Online
           </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}