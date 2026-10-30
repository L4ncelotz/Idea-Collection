import Link from 'next/link'
import { StatusBadge } from '@/components/status-badge'
import type { Idea } from '@/lib/types'
import { formatUpdatedAt } from '@/lib/time'

/**
 * Presentational idea card for the list grid.
 * One card links to one detail page — nothing more.
 */
export function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-1 font-semibold tracking-tight group-hover:underline group-hover:underline-offset-2">
          {idea.title}
        </h3>
        <StatusBadge status={idea.status} />
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm text-neutral-500">
        {idea.description || <span className="italic text-neutral-300">No description</span>}
      </p>
      <span className="mt-3 text-xs text-neutral-400">{formatUpdatedAt(idea.updated_at)}</span>
    </Link>
  )
}
