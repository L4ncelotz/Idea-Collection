'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function AppHeader({ email }: { email?: string | null }) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span className="font-semibold tracking-tight">Idea Vault</span>
        </div>
        <div className="flex items-center gap-3">
          {email ? (
            <span className="hidden text-xs text-muted-foreground sm:block">{email}</span>
          ) : null}
          <Button
            type="button"
            onClick={signOut}
            variant="ghost"
            size="icon-sm"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  )
}
