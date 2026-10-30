/**
 * Central Supabase config resolution.
 * Throws a clear message (instead of a cryptic one) when env vars are missing.
 */
export function supabaseConfig(): { url: string; anon: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error(
      'Missing Supabase config. Copy .env.local.example to .env.local and fill the values (see docs/SETUP.md).'
    )
  }
  return { url, anon }
}
