import { IDEA_STATUSES, type IdeaStatus } from './types'

export interface StatusMeta {
  readonly label: IdeaStatus
  /** Tailwind classes for the badge pill. */
  readonly badge: string
  /** Tailwind classes for the small status dot used next to text. */
  readonly dot: string
}

/**
 * Visual metadata per status — the only place that knows status colors,
 * so a restyle never leaks into component code.
 */
export const STATUS_META: Record<IdeaStatus, StatusMeta> = {
  Idea: {
    label: 'Idea',
    badge: 'bg-sky-100 text-sky-700',
    dot: 'bg-sky-500',
  },
  Building: {
    label: 'Building',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  Done: {
    label: 'Done',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
}

/** Type guard for a status string coming from the DB or user input. */
export function isIdeaStatus(value: string): value is IdeaStatus {
  return (IDEA_STATUSES as readonly string[]).includes(value)
}
