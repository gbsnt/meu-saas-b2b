// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 🕵️ LOGS DE DEBUG
console.log("--- DEBUG SUPABASE ---")
console.log("URL:", `|${supabaseUrl}|`) // Os pipes | ajudam a ver espaços vazios
console.log("KEY TYPE:", typeof supabaseAnonKey)
console.log("----------------------")

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error("❌ ERRO CRÍTICO: A URL do Supabase é inválida ou está vazia no .env.local")
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')