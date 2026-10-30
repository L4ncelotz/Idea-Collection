'use client'

import { useMemo, useState } from 'react'
import { Plus, Search, SearchX, Sparkles } from 'lucide-react'
import { IdeaCard } from '@/components/idea-card'
import { NewIdeaModal } from '@/components/new-idea-modal'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
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
        <Button type="button" onClick={() => setCreating(true)}>
          <Plus data-icon="inline-start" />
          New Idea
        </Button>
      </div>

      {/* Search */}
      {hasIdeas ? (
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or description…"
            aria-label="Search ideas"
            className="h-9 rounded-full pl-9"
          />
        </div>
      ) : null}

      {/* Content */}
      {!hasIdeas ? (
        <EmptyVault onNew={() => setCreating(true)} />
      ) : filtered.length === 0 ? (
        <Empty className="mt-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>No matches</EmptyTitle>
            <EmptyDescription>No ideas match “{query}”</EmptyDescription>
          </EmptyHeader>
        </Empty>
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
    <Empty className="mt-16">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-12 rounded-full">
          <Sparkles className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Your vault is empty</EmptyTitle>
        <EmptyDescription>
          Got an idea you&apos;re not ready to build yet? Park it here — it won&apos;t disappear.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" onClick={onNew}>
          <Plus data-icon="inline-start" />
          Add your first idea
        </Button>
      </EmptyContent>
    </Empty>
  )
}
