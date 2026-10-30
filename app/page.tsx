import { TriangleAlert } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { IdeaList } from '@/components/idea-list'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { fetchIdeas } from '@/lib/ideas'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: ideas, error } = await fetchIdeas(supabase)

  return (
    <div className="min-h-dvh">
      <AppHeader email={user?.email} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6">
        {error ? (
          <Alert variant="destructive" className="mt-12">
            <TriangleAlert />
            <AlertTitle>Failed to load your ideas</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : (
          <IdeaList initialIdeas={ideas ?? []} />
        )}
      </main>
    </div>
  )
}
