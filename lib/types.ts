export type IdeaStatus = 'Idea' | 'Building' | 'Done'

/** Canonical order used by segmented controls and validation. */
export const IDEA_STATUSES: readonly IdeaStatus[] = ['Idea', 'Building', 'Done'] as const

/**
 * One Idea = one project idea card.
 * 1:1 with a row in the `ideas` table (see supabase/schema.sql).
 */
export interface Idea {
  id: string
  user_id: string
  title: string
  description: string
  readme: string
  status: IdeaStatus
  created_at: string
  updated_at: string
}

/** Payload used when creating a brand-new idea (README optional, per spec). */
export interface IdeaDraft {
  title: string
  description: string
}

/** Payload for editing an existing idea. */
export type IdeaPatch = Partial<Pick<Idea, 'title' | 'description' | 'readme' | 'status'>>
