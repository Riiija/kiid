import { createClient } from '@supabase/supabase-js'
import type { Database } from './database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function requireSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase n'est pas configure. Renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.")
  }

  return supabase
}
