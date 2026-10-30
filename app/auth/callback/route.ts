import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth callback: exchange the Google code for a Supabase session,
 * then continue to the vault (or back to /login with a reason).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const oauthError = searchParams.get('error')

  if (oauthError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(oauthError)}`, origin)
    )
  }

  const code = searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL('/login?error=exchange_failed', origin))
  }

  return NextResponse.redirect(new URL('/', origin))
}
