import { describe, expect, it } from 'vitest'
import { validateIdeaTitle } from '@/lib/validate'

describe('validateIdeaTitle', () => {
  it('accepts and trims a normal title', () => {
    expect(validateIdeaTitle('  Focus Garden ')).toEqual({ ok: true, value: 'Focus Garden' })
  })

  it('rejects empty and whitespace-only titles', () => {
    expect(validateIdeaTitle('')).toEqual({ ok: false, error: 'Title is required' })
    expect(validateIdeaTitle('    ')).toEqual({ ok: false, error: 'Title is required' })
  })
})
