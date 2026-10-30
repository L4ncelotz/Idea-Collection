import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <span className="text-3xl">💡</span>
          <CardTitle className="text-xl">Idea Vault</CardTitle>
          <CardDescription>Think it. Save it. Build it later.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm authError={error ?? null} />
        </CardContent>
      </Card>
    </div>
  )
}
