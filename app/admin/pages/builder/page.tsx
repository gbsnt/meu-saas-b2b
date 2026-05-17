'use client'

import { useEffect, useState, Suspense } from 'react'
import { Puck } from "@measured/puck"
import "@measured/puck/puck.css"
import { config } from "@/lib/puck.config"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from 'next/navigation'

function BuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pageId = searchParams.get('id')

  const [initialData, setInitialData] = useState<any>({})
  const [dynamicConfig, setDynamicConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function prepareBuilder() {
      try {
        setLoading(true)
        
        // 1. Busca os dados reais do banco de dados
        const { data: dbProducts } = await supabase
          .from('products')
          .select('id, name')
          .eq('is_active', true)

        const { data: dbCategories } = await supabase
          .from('categories')
          .select('id, name')

        // 2. Forçamos a tipagem para 'any' para evitar que o TypeScript trave em propriedades opcionais/unions
        const updatedConfig = {
          ...config,
          components: {
            ...config.components
          }
        } as any

        // 3. Injeta a lista de produtos reais com segurança de referência
        if (dbProducts && updatedConfig.components.ProductCardBlock?.fields?.productId) {
          updatedConfig.components.ProductCardBlock.fields = {
            ...updatedConfig.components.ProductCardBlock.fields,
            productId: {
              ...updatedConfig.components.ProductCardBlock.fields.productId,
              options: dbProducts.map(p => ({
                label: p.name.toUpperCase(),
                value: p.id
              }))
            }
          }
        }

        // 4. Injeta a lista de categorias reais contornando o erro do 'arrayFields'
        if (dbCategories && updatedConfig.components.CategoryGridBlock?.fields?.categories?.arrayFields?.categoryId) {
          updatedConfig.components.CategoryGridBlock.fields = {
            ...updatedConfig.components.CategoryGridBlock.fields,
            categories: {
              ...updatedConfig.components.CategoryGridBlock.fields.categories,
              arrayFields: {
                ...updatedConfig.components.CategoryGridBlock.fields.categories.arrayFields,
                categoryId: {
                  ...updatedConfig.components.CategoryGridBlock.fields.categories.arrayFields.categoryId,
                  options: dbCategories.map(c => ({
                    label: c.name.toUpperCase(),
                    value: c.id
                  }))
                }
              }
            }
          }
        }

        setDynamicConfig(updatedConfig)

        // 5. Carrega o conteúdo se for edição
        if (pageId) {
          const { data } = await supabase.from('custom_pages').select('content').eq('id', pageId).single()
          if (data && data.content) {
            setInitialData(Array.isArray(data.content) ? {} : data.content)
          }
        }

      } catch (err) {
        console.error("Erro fatal ao sincronizar catálogo:", err)
      } finally {
        setLoading(false)
      }
    }
    prepareBuilder()
  }, [pageId])

  const handlePublish = async (data: any) => {
    try {
      if (pageId) {
        const { error } = await supabase.from('custom_pages').update({ content: data, is_published: true }).eq('id', pageId)
        if (error) throw error
        alert("Página atualizada com sucesso!_")
      } else {
        const title = window.prompt("Qual o título desta página?")
        if (!title) return
        let slug = window.prompt("Qual a URL da página? Ex: blackfriday")
        if (!slug) return
        slug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')

        const { error } = await supabase.from('custom_pages').insert([{ title, slug, content: data, is_published: true }])
        if (error) throw error
        alert("Página criada com sucesso!_")
        router.push('/admin/pages')
      }
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message)
    }
  }

  if (loading || !dynamicConfig) {
    return (
      <div className="h-screen flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse bg-white">
        Sincronizando Catálogo Oficial STUDIO_
      </div>
    )
  }

  return (
    <div className="h-screen w-full">
      <Puck config={dynamicConfig} data={initialData} onPublish={handlePublish} />
    </div>
  )
}

export default function PageBuilderAdmin() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-xs font-black uppercase tracking-widest text-gray-400">Iniciando...</div>}>
      <BuilderContent />
    </Suspense>
  )
}