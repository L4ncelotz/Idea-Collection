'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from '@/components/modal'
import { createIdea } from '@/lib/ideas'
import { createClient } from '@/lib/supabase/client'
import { validateIdeaTitle } from '@/lib/validate'
import type { Idea } from '@/lib/types'

interface NewIdeaModalProps {
  onClose: () => void
  /** Called with the freshly created idea (already mapped through the app model). */
  onCreated: (idea: Idea) => void
}

/**
 * New Idea modal — per spec: Title + Description, Save immediately.
 * README is optional and lives in the detail page.
 */
export function NewIdeaModal({ onClose, onCreated }: NewIdeaModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    const check = validateIdeaTitle(title)
    if (!check.ok) {
      setTitleError(check.error)
      return
    }
    setTitleError(null)
    setSaving(true)
    const { data, error } = await createIdea(createClient(), { title, description })
    if (error || !data) {
      // Keep the user's text in the form — nothing is lost on failure.
      setSaveError('Failed to save. Check your connection and try again.')
      setSaving(false)
      return
    }
    onCreated(data)
  }

  return (
    <Modal open onClose={onClose} title="New Idea" closeOnBackdrop={!saving}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void save()
        }}
      >
        <label htmlFor="new-idea-title" className="text-sm font-medium">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="new-idea-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (titleError) setTitleError(null)
          }}
          autoFocus
          placeholder="e.g. Focus Garden"
          className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-200"
        />
        {titleError ? <p className="mt-1.5 text-xs text-red-600">{titleError}</p> : null}
        {saveError ? <p className="mt-1.5 text-xs text-red-600">{saveError}</p> : null}

        <label htmlFor="new-idea-description" className="mt-4 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="new-idea-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What is it? Why make it?"
          className="mt-1.5 w-full resize-none rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:ring-2 focus:ring-neutral-200"
        />

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full px-4 py-2 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            Save
          </button>
        </div>
      </form>
    </Modal>
  )
}
