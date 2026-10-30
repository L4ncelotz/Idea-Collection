'use client'

import { useMemo, useState } from 'react'
import { Plus, SearchX, Sparkles } from 'lucide-react'
import { IdeaCard } from '@/components/idea-card'
import { NewIdeaModal } from '@/components/new-idea-modal'
import { filterIdeas } from '@/lib/search'
import type { Idea } from '@/lib/types'

/**
 * The Idea List screen: header + search + cards + New Idea modal.
 * Receives the server-fetched list and handles search/filtering locally (per spec).
 */
export function IdeaList({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => filterIdeas(ideas, query), [ideas, query])
  const hasIdeas = ideas.length > 0

  function onCreated(idea: Idea) {
    setIdeas((prev) => [idea, ...prev])
    setCreating(false)
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Your Ideas</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          <Plus size={16} /> New Idea
        </button>
      </div>

      {/* Search */}
      {hasIdeas ? (
        <div className="relative mt-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or description…"
            className="w-full rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:ring-2 focus:ring-neutral-200"
            aria-label="Search ideas"
          />
        </div>
      ) : null}

      {/* Content */}
      {!hasIdeas ? (
        <EmptyVault onNew={() => setCreating(true)} />
      ) : filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <SearchX className="text-neutral-300" size={40} />
          <p className="mt-3 text-sm text-neutral-400">
            No ideas match “{query}”
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}

      {creating ? (
        <NewIdeaModal onClose={() => setCreating(false)} onCreated={onCreated} />
      ) : null}
    </div>
  )
}

function EmptyVault({ onNew }: { onNew: () => void }) {
  return (
    <div className="mt-20 flex flex-col items-center text-center">
      <div className="rounded-full bg-neutral-100 p-5">
        <Sparkles className="text-neutral-400" size={28} />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Your vault is empty</h2>
      <p className="mt-1 max-w-xs text-sm text-neutral-500">
        Got an idea you&apos;re not ready to build yet? Park it here — it won&apos;t disappear.
      </p>
      <button
        type="button"
        onClick={onNew}
        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
      >
        <Plus size={16} /> Add your first idea
      </button>
    </div>
  )
}
