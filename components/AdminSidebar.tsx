'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Square2StackIcon, 
  TagIcon, 
  ArrowLeftOnRectangleIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

export default function AdminSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard_', href: '/admin', icon: HomeIcon },
    { name: 'Produtos_', href: '/admin/products', icon: Square2StackIcon },
    { name: 'Categorias_', href: '/admin/categories', icon: TagIcon },
  ]

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-100">
      {/* LOGO ADMIN */}
      <div className="flex h-20 items-center px-8 border-b border-gray-50">
        <span className="text-xl font-black italic tracking-tighter text-gray-900">
          STUDIO_ <span className="text-[10px] not-italic font-bold text-gray-300 ml-1">ADMIN</span>
        </span>
      </div>

      {/* LINKS DE NAVEGAÇÃO */}
      <nav className="flex-1 space-y-1 px-4 py-8">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-lg
                ${isActive 
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <item.icon className={`mr-3 h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-gray-900'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* FOOTER DA SIDEBAR */}
      <div className="p-4 border-t border-gray-50">
        <Link 
          href="/" 
          className="flex items-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="mr-3 h-4 w-4" />
          Sair do Painel
        </Link>
      </div>
    </div>
  )
}