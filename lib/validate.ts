/**
 * Validate "Title is required" rules shared by the New Idea modal and the editor.
 * Returns the trimmed title when valid, or an error message when not.
 */
export function validateIdeaTitle(title: string): { ok: true; value: string } | { ok: false; error: string } {
  const value = title.trim()
  if (!value) return { ok: false, error: 'Title is required' }
  return { ok: true, value }
}
