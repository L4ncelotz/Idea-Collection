import { notFound } from 'next/navigation'
import { AppHeader } from '@/components/app-header'
import { IdeaEditor } from '@/components/idea-editor'
import { fetchIdea } from '@/lib/ideas'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Idea detail' }

/** Postgres code for an invalid UUID literal — treat it exactly like "not found". */
const INVALID_UUID = '22P02'

export default async function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: idea, error } = await fetchIdea(supabase, id)

  // invalid UUID or RLS-hidden row ("someone else's idea") → same 404 as missing
  if (error && error.code === INVALID_UUID) notFound()
  if (!idea) notFound()
  if (error) {
    return (
      <div className="min-h-dvh">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 pt-16 text-sm text-red-600">
          Failed to load this idea: {error.message}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
        <IdeaEditor idea={idea} />
      </main>
    </div>
  )
}
