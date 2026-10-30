import { describe, expect, it } from 'vitest'
import { filterIdeas, isEditableFieldsEqual } from '@/lib/search'
import type { Idea } from '@/lib/types'

function idea(partial: Partial<Idea> & { id: string; title: string }): Idea {
  return {
    user_id: 'u1',
    description: '',
    readme: '',
    status: 'Idea',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...partial,
  }
}

const SAMPLE: Idea[] = [
  idea({ id: '1', title: 'Focus Garden', description: 'Pomodoro timer with plants' }),
  idea({ id: '2', title: 'TinyDiff', description: 'Compare two texts and highlight lines difference' }),
  idea({ id: '3', title: 'Streakly', description: 'Daily habit heatmap', status: 'Done' }),
]

describe('filterIdeas', () => {
  it('returns the same list (copy) when the query is empty', () => {
    expect(filterIdeas(SAMPLE, '')).toEqual(SAMPLE)
    expect(filterIdeas(SAMPLE, '   ')).toEqual(SAMPLE)
  })

  it('matches by title, case-insensitively', () => {
    expect(filterIdeas(SAMPLE, 'tinydiff').map((i) => i.id)).toEqual(['2'])
    expect(filterIdeas(SAMPLE, 'FOCUS').map((i) => i.id)).toEqual(['1'])
  })

  it('matches by description when the title does not match', () => {
    expect(filterIdeas(SAMPLE, 'heatmap').map((i) => i.id)).toEqual(['3'])
  })

  it('matches partial words', () => {
    expect(filterIdeas(SAMPLE, 'diff').map((i) => i.id)).toEqual(['2'])
  })

  it('returns nothing for a totally unrelated query', () => {
    expect(filterIdeas(SAMPLE, 'blockchain')).toEqual([])
  })

  it('matches across title OR description', () => {
    expect(filterIdeas(SAMPLE, 'garden').map((i) => i.id)).toEqual(['1'])
  })
})

const BASE = idea({ id: 'x', title: 'A' })

describe('isEditableFieldsEqual (unsaved-changes tracking)', () => {
  it('equal when all editable fields match', () => {
    const b: Idea = { ...BASE }
    expect(isEditableFieldsEqual(BASE, b)).toBe(true)
  })

  it('detects a README edit', () => {
    const b: Idea = { ...BASE, readme: '# hello' }
    expect(isEditableFieldsEqual(BASE, b)).toBe(false)
  })

  it('detects a status change', () => {
    const b: Idea = { ...BASE, status: 'Building' }
    expect(isEditableFieldsEqual(BASE, b)).toBe(false)
  })

  it('ignores timestamps and ids — only editable fields matter', () => {
    const b: Idea = { ...BASE, id: 'y', user_id: 'u2', updated_at: '2030-01-01T00:00:00Z' }
    expect(isEditableFieldsEqual(BASE, b)).toBe(true)
  })
})
