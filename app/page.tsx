import { AppHeader } from '@/components/app-header'
import { fetchIdeas } from '@/lib/ideas'
import { createClient } from '@/lib/supabase/server'
import { IdeaList } from '@/components/idea-list'

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
          <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p className="font-medium">Failed to load your ideas</p>
            <p className="mt-1 text-red-600/80">{error.message}</p>
          </div>
        ) : (
          <IdeaList initialIdeas={ideas ?? []} />
        )}
      </main>
    </div>
  )
}
