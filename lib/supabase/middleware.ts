import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseConfig } from './config'

/**
 * Session refresh + auth gate, called from the root proxy.ts on every request.
 * - refreshes the Supabase session cookie so Server Components can read it
 * - redirects anonymous users to /login (except /login and /auth/*)
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { url, anon } = supabaseConfig()
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // getUser() re-validates the JWT with the server — do not use getSession() here.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicPaths = ['/login', '/auth']
  const isPublic = publicPaths.some((p) => request.nextUrl.pathname.startsWith(p))

  if (!user && !isPublic) {
    const url2 = request.nextUrl.clone()
    url2.pathname = '/login'
    return NextResponse.redirect(url2)
  }

  // Signed-in users shouldn't stare at the login page.
  if (user && request.nextUrl.pathname === '/login') {
    const url2 = request.nextUrl.clone()
    url2.pathname = '/'
    return NextResponse.redirect(url2)
  }

  return supabaseResponse
}
