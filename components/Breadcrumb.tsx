'use client'

import Link from 'next/link'

interface BreadcrumbItem {
  name: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  // Filtramos itens que por acaso venham sem nome (prevenção de erro)
  const validItems = items.filter(item => item.name && item.name.trim() !== "")

  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        {/* Item Fixo: HOME (O único que aponta para a raiz) */}
        <li>
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
        </li>
        
        {validItems.map((item, index) => {
          const isLast = index === validItems.length - 1
          
          return (
            <li key={`${item.name}-${index}`} className="flex items-center">
              <span className="px-2 text-gray-200">/</span>
              {isLast || !item.href ? (
                // O último item (Nome do Produto ou Categoria Atual)
                <span className="text-gray-900 italic font-black">
                  {item.name}_
                </span>
              ) : (
                // Categorias intermediárias
                <Link href={item.href} className="hover:text-gray-900 transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}