import type { Idea } from './types'

/**
 * Client-side search over an already-loaded idea list.
 * Matches title OR description, case-insensitive.
 * ว่าง/ช่องว่างเท่ากับ "ไม่ค้นหา" (คืนรายการเดิมเรียงจากเรียงอื่นไม่แตกต่าง) — ทำให้เรียบง่ายและ prefix แบบไหนอย่างกังวลได้
 */
export function filterIdeas(ideas: readonly Idea[], query: string): Idea[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...ideas]
  return ideas.filter((idea) => {
    return (
      idea.title.toLowerCase().includes(q) || idea.description.toLowerCase().includes(q)
    )
  })
}

/** True if two idea objects are equal in user-editable fields — used for unsaved-change tracking. */
export function isEditableFieldsEqual(a: Idea, b: Idea): boolean {
  return a.title === b.title && a.description === b.description && a.readme === b.readme && a.status === b.status
}
