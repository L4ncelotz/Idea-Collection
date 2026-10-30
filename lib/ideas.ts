import type { SupabaseClient } from '@supabase/supabase-js'
import { mapIdea, type DbIdeaRow } from './database'
import { isIdeaStatus } from './status'
import type { Idea, IdeaDraft, IdeaPatch } from './types'

/**
 * Data access layer for ideas.
 * Every call goes straight to Supabase; access control is enforced by
 * Row Level Security (RLS) at the database, not here.
 * The Supabase client is passed in so both browser and server contexts can use these helpers.
 */

type Err = { message: string; code?: string }

/**
 * Plain result shape (NOT a discriminated union): `{ data, error }`.
 * Kept simple on purpose — data and error are checked independently, and
 * TypeScript stays out of byte-level cross-field narrowing games.
 */
type Result<T> = { data: T | null; error: Err | null }

/** List all of the signed-in user's ideas, newest-updated first. */
export async function fetchIdeas(client: SupabaseClient): Promise<Result<Idea[]>> {
  const { data, error } = await client
    .from('ideas')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) return { data: null, error: { message: error.message, code: error.code } }
  return { data: ((data ?? []) as DbIdeaRow[]).map(mapIdea), error: null }
}

/** Load one idea by id. Returns null when it doesn't exist or belongs to someone else (RLS). */
export async function fetchIdea(client: SupabaseClient, id: string): Promise<Result<Idea | null>> {
  const { data, error } = await client
    .from('ideas')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) return { data: null, error: { message: error.message, code: error.code } }
  if (!data) return { data: null, error: null }
  return { data: mapIdea(data as DbIdeaRow), error: null }
}

/** Create a new idea. README is optional at creation (per product spec). */
export async function createIdea(client: SupabaseClient, draft: IdeaDraft): Promise<Result<Idea>> {
  const { data, error } = await client
    .from('ideas')
    .insert({
      // user_id is not needed: the DB default is auth.uid(), and RLS checks it anyway.
      title: draft.title.trim(),
      description: draft.description.trim(),
    })
    .select('*')
    .single()

  if (error) return { data: null, error: { message: error.message, code: error.code } }
  if (!data) {
    return { data: null, error: { message: 'Failed to create idea' } }
  }
  return { data: mapIdea(data as DbIdeaRow), error: null }
}

/** Update mutable fields. Always bumps updated_at (spec: "บันทึกเป็นรอบ"). */
export async function updateIdea(
  client: SupabaseClient,
  id: string,
  patch: IdeaPatch
): Promise<Result<Idea>> {
  const { data, error } = await client
    .from('ideas')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return { data: null, error: { message: error.message, code: error.code } }
  if (!data) return { data: null, error: { message: 'Idea not found' } }
  return { data: mapIdea(data as DbIdeaRow), error: null }
}

/** Hard delete with RLS protection (you can only delete your own row). */
export async function deleteIdea(client: SupabaseClient, id: string): Promise<Result<null>> {
  const { error } = await client.from('ideas').delete().eq('id', id)
  if (error) return { data: null, error: { message: error.message, code: error.code } }
  return { data: null, error: null }
}

// narag: isIdeaStatus imported only to keep the type-guard colocated — remove if unused.
export { isIdeaStatus }
