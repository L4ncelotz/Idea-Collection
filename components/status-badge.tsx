import { Badge } from '@/components/ui/badge'
import { STATUS_META } from '@/lib/status'
import type { IdeaStatus } from '@/lib/types'

export function StatusBadge({ status }: { status: IdeaStatus }) {
  const meta = STATUS_META[status]
  return (
    <Badge className={`${meta.badge} border-transparent`}>
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </Badge>
  )
}
