'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'

let browserClient: SupabaseClient | null = null

/** Browser-side Supabase client (singleton per tab). */
export function createClient(): SupabaseClient {
  if (browserClient) return browserClient
  const { url, anon } = supabaseConfig()
  browserClient = createBrowserClient(url, anon)
  return browserClient
}
