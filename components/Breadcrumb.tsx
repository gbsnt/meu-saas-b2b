import Link from 'next/link'

interface BreadcrumbItem {
  name: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
        {/* Item Fixo: Home */}
        <li>
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
        </li>
        
        {/* Itens Dinâmicos */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          
          return (
            <li key={item.name} className="flex items-center">
              <span className="px-2 text-gray-200">/</span>
              {isLast || !item.href ? (
                // Último item fica destacado e sem link
                <span className="text-gray-900 italic font-black">{item.name}</span>
              ) : (
                // Itens intermediários são links clicáveis
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