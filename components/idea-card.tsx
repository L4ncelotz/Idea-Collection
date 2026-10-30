import Link from 'next/link'
import { StatusBadge } from '@/components/status-badge'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Idea } from '@/lib/types'
import { formatUpdatedAt } from '@/lib/time'

/**
 * Presentational idea card for the list grid.
 * One card links to one detail page — nothing more.
 */
export function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <Link href={`/ideas/${idea.id}`} className="group/idea block h-full">
      <Card
        size="sm"
        className="h-full transition-shadow group-hover/idea:shadow-md hover:ring-foreground/20"
      >
        <CardHeader>
          <CardTitle className="line-clamp-1 text-base group-hover/idea:underline group-hover/idea:underline-offset-2">
            {idea.title}
          </CardTitle>
          <CardAction>
            <StatusBadge status={idea.status} />
          </CardAction>
          <CardDescription className="line-clamp-2 min-h-10">
            {idea.description || (
              <span className="italic text-muted-foreground/60">No description</span>
            )}
          </CardDescription>
        </CardHeader>
        <div className="mt-auto px-(--card-spacing) text-xs text-muted-foreground">
          Updated {formatUpdatedAt(idea.updated_at)}
        </div>
      </Card>
    </Link>
  )
}
