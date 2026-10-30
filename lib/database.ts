import type { Idea } from './types'
import { isIdeaStatus } from './status'

/**
 * Database row shape for the `ideas` table (matches supabase/schema.sql).
 */
export interface DbIdeaRow {
  id: string
  user_id: string
  title: string
  description: string
  readme: string
  status: string
  created_at: string
  updated_at: string
}

/**
 * Coerce a raw DB row into the app-level Idea model.
 * Unknown status strings fall back to `Idea` so a typo in data can never crash the UI.
 */
export function mapIdea(row: DbIdeaRow): Idea {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    readme: row.readme,
    status: isIdeaStatus(row.status) ? row.status : 'Idea',
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}
