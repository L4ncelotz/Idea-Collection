/**
 * Central Supabase config resolution.
 * Throws a clear message (instead of a cryptic one) when env vars are missing.
 *
 * Supabase now issues two key styles:
 * - legacy "anon public" JWT → NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - new "publishable" key → NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 * Either works with the client library; we accept whichever is present.
 */
export function supabaseConfig(): { url: string; anon: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !anon) {
    throw new Error(
      'Missing Supabase config. Copy .env.local.example to .env.local and fill NEXT_PUBLIC_SUPABASE_URL plus NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) — see docs/SETUP.md.'
    )
  }
  return { url, anon }
}
