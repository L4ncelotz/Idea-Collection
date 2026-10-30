import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/login-form'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Sign in' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  // Already signed in? Straight to the vault.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/')

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <span className="text-3xl">💡</span>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">Idea Vault</h1>
          <p className="mt-1 text-sm text-neutral-500">Think it. Save it. Build it later.</p>
        </div>
        <LoginForm authError={error ?? null} />
      </div>
    </div>
  )
}
