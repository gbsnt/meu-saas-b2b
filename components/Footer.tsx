'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Footer() {
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    async function loadFooterCategories() {
      // 1. Busca Categorias respeitando a ordem
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, order_index')
        .order('order_index', { ascending: true })

      // 2. Verifica quais têm produtos ativos
      const { data: activeProducts } = await supabase
        .from('products')
        .select('category_id, category')
        .eq('is_active', true)

      if (cats && activeProducts) {
        const activeIds = new Set(activeProducts.map(p => p.category_id))
        const activeNames = new Set(activeProducts.map(p => p.category))

        // 3. Filtra as vazias e limita a 5 itens para não quebrar a estética do rodapé
        const populatedCategories = cats
          .filter(c => activeIds.has(c.id) || activeNames.has(c.name))
          .slice(0, 5)
        
        setCategories(populatedCategories)
      }
    }
    loadFooterCategories()
  }, [])

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-[10px] font-bold uppercase tracking-widest">
          
          <div className="col-span-2 space-y-4">
            <span className="text-xl font-black text-gray-900 italic tracking-tighter">STUDIO_</span>
            <p className="text-gray-500 max-w-xs leading-relaxed">
              Curadoria minimalista focada em qualidade extrema e design atemporal. Feito para durar.
            </p>
          </div>
          
          {/* COLUNA SHOP DINÂMICA */}
          <div>
            <h3 className="text-gray-900 mb-6">Shop</h3>
            <ul className="space-y-4 text-gray-400">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <a 
                      href={`/category/${encodeURIComponent(cat.name)}`} 
                      className="hover:text-gray-900 transition-colors"
                    >
                      {cat.name}
                    </a>
                  </li>
                ))
              ) : (
                <li className="animate-pulse">A sincronizar_</li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="text-gray-900 mb-6">Support</h3>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
            </ul>
          </div>
          
        </div>
        
        <div className="mt-12 border-t border-gray-100 pt-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
          &copy; {new Date().getFullYear()} STUDIO_ INC. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  )
}