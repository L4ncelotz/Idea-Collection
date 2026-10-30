/**
 * "Updated X ago" formatting used on cards and the detail page.
 * Pure so it can be unit-tested; callers may pass `now` in tests.
 *
 * < 1 min   → "just now"
 * < 60 min  → "Xm ago"
 * < 24 h    → "Xh ago"
 * < 7 days  → "Xd ago"
 * this year → "12 Mar"
 * otherwise → "12 Mar 2025"
 */
export function formatUpdatedAt(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  const diffMs = now.getTime() - date.getTime()
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < minute) return 'just now'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`

  const sameYear =
    date.getFullYear() === now.getFullYear()
  if (sameYear) {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
