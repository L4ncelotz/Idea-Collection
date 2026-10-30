import { describe, expect, it } from 'vitest'
import { STATUS_META, isIdeaStatus } from '@/lib/status'

describe('isIdeaStatus', () => {
  it('accepts the three canonical values', () => {
    expect(isIdeaStatus('Idea')).toBe(true)
    expect(isIdeaStatus('Building')).toBe(true)
    expect(isIdeaStatus('Done')).toBe(true)
  })

  it('rejects anything else — data typos never crash the UI', () => {
    expect(isIdeaStatus('idea')).toBe(false)
    expect(isIdeaStatus('DONE')).toBe(false)
    expect(isIdeaStatus('banana')).toBe(false)
    expect(isIdeaStatus('')).toBe(false)
  })
})

describe('STATUS_META', () => {
  it('has a visual variant for every status (nothing falls out of the UI)', () => {
    for (const key of ['Idea', 'Building', 'Done'] as const) {
      expect(STATUS_META[key].label).toBe(key)
      expect(STATUS_META[key].badge).toMatch(/text-/)
      expect(STATUS_META[key].dot).toMatch(/bg-/)
    }
  })
})
