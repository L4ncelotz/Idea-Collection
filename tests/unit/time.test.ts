import { describe, expect, it } from 'vitest'
import { formatUpdatedAt } from '@/lib/time'

const NOW = new Date('2026-10-30T12:00:00Z')

describe('formatUpdatedAt', () => {
  it('says "just now" for anything under a minute', () => {
    expect(formatUpdatedAt('2026-10-30T11:59:40Z', NOW)).toBe('just now')
  })

  it('formats minutes', () => {
    expect(formatUpdatedAt('2026-10-30T11:42:00Z', NOW)).toBe('18m ago')
  })

  it('formats hours', () => {
    expect(formatUpdatedAt('2026-10-30T07:00:00Z', NOW)).toBe('5h ago')
  })

  it('formats days under a week', () => {
    expect(formatUpdatedAt('2026-10-28T12:00:00Z', NOW)).toBe('2d ago')
  })

  it('falls back to a short date in the same year', () => {
    expect(formatUpdatedAt('2026-03-12T10:00:00Z', NOW)).toBe('12 Mar')
  })

  it('includes the year once we cross into a previous year', () => {
    expect(formatUpdatedAt('2025-11-02T10:00:00Z', NOW)).toBe('2 Nov 2025')
  })
})
