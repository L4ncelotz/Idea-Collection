import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js 16 proxy (formerly middleware).
 * Refreshes the Supabase session and gates every page behind the login.
 * Matcher excludes static assets only — /login and /auth are handled inside updateSession.
 */
export default async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Run on all application routes except static assets:
     * - _next/static, _next/image
     * - favicon & public images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
}
