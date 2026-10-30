import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { supabaseConfig } from './config'

/**
 * Server-side Supabase client bound to the request cookie session.
 * Always call `await createClient()` inside a Server Component or Route Handler.
 */
export async function createClient(): Promise<SupabaseClient> {
  // Read cookies FIRST: this is what tells Next.js the route needs a request
  // (dynamic rendering) — before anything that can throw on missing env.
  const cookieStore = await cookies()

  const { url, anon } = supabaseConfig()

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot mutate cookies — the proxy (root proxy.ts)
          // refreshes the session cookie for every request instead.
        }
      },
    },
  })
}
