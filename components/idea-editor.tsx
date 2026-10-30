'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal'
import { ReadmeEditor } from '@/components/readme-editor'
import { ToastViewport, useToasts } from '@/components/toast'
import { deleteIdea, updateIdea } from '@/lib/ideas'
import { isEditableFieldsEqual } from '@/lib/search'
import { STATUS_META } from '@/lib/status'
import { createClient } from '@/lib/supabase/client'
import { validateIdeaTitle } from '@/lib/validate'
import { formatUpdatedAt } from '@/lib/time'
import type { Idea, IdeaStatus } from '@/lib/types'

/**
 * Idea Detail / Edit screen:
 * - editable Title / Description / Status
 * - README with Edit/Preview toggle
 * - Save button (explicit, bumps updated_at), Delete with a typed confirmation
 * - guards against losing unsaved changes
 */
export function IdeaEditor({ idea: initial }: { idea: Idea }) {
  const router = useRouter()
  const { toasts, push } = useToasts()

  const [idea, setIdea] = useState<Idea>(initial)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const dirty = useMemo(() => !isEditableFieldsEqual(idea, initial), [idea, initial])

  const titleCheck = validateIdeaTitle(idea.title)
  const canSave = Boolean(titleCheck.ok) && dirty && !saving

  // Warn before unload/reload while there are unsaved changes (spec: error handling).
  useEffect(() => {
    if (!dirty) return
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  function patch(values: Partial<Pick<Idea, 'title' | 'description' | 'status' | 'readme'>>) {
    setIdea((prev) => ({ ...prev, ...values }))
  }

  async function save() {
    const check = validateIdeaTitle(idea.title)
    if (!check.ok) return
    setSaving(true)
    const { data, error } = await updateIdea(createClient(), idea.id, {
      title: idea.title,
      description: idea.description,
      readme: idea.readme,
      status: idea.status,
    })
    setSaving(false)
    if (error || !data) {
      push('Save failed — check your connection and try again', 'error')
      return
    }
    setIdea(data)
    push('Saved')
    router.refresh() // keeps the surrounding page data honest
  }

  async function handleDelete() {
    setDeleting(true)
    const { error } = await deleteIdea(createClient(), idea.id)
    if (error) {
      setDeleting(false)
      setConfirmOpen(false)
      push('Delete failed — try again in a moment', 'error')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="pb-20">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-neutral-500 transition hover:bg-neutral-200/70 hover:text-neutral-900"
        >
          <ArrowLeft size={15} /> Your Ideas
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={15} /> Delete
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!canSave}
            title={!canSave ? 'Nothing to save (or title is invalid)' : 'Save changes'}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Save
            {dirty ? <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> : null}
          </button>
        </div>
      </div>

      {/* Meta line */}
      <div className="mt-2 flex items-center gap-2 pl-3 text-xs text-neutral-400">
        <span>Created {formatUpdatedAt(initial.created_at)}</span>
        {formatUpdatedAt(initial.created_at) !== formatUpdatedAt(idea.updated_at) ? (
          <>
            <span>·</span>
            <span>Updated {formatUpdatedAt(idea.updated_at)}</span>
          </>
        ) : null}
      </div>

      {/* Fields */}
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <label htmlFor="detail-title" className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Title
        </label>
        <input
          id="detail-title"
          value={idea.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Project title"
          className="mt-1 w-full rounded-xl border border-transparent px-2 py-1.5 text-lg font-semibold tracking-tight outline-none transition focus:border-neutral-200 focus:bg-neutral-50"
        />
        {!titleCheck.ok ? (
          <p className="mt-1 text-xs text-red-600">{titleCheck.error}</p>
        ) : null}

        <label htmlFor="detail-description" className="mt-4 block text-xs font-medium uppercase tracking-wide text-neutral-400">
          Description
        </label>
        <textarea
          id="detail-description"
          value={idea.description}
          onChange={(e) => patch({ description: e.target.value })}
          rows={2}
          placeholder="What is it? Why make it?"
          className="mt-1 w-full resize-none rounded-xl border border-transparent px-2 py-1.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-200 focus:bg-neutral-50"
        />

        <span className="mt-4 block text-xs font-medium uppercase tracking-wide text-neutral-400">
          Status
        </span>
        <div className="mt-1.5 inline-flex rounded-full bg-neutral-100 p-1" role="radiogroup" aria-label="Status">
          {(Object.keys(STATUS_META) as IdeaStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={idea.status === s}
              onClick={() => patch({ status: s })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                idea.status === s
                  ? `${STATUS_META[s].badge} shadow-sm`
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* README */}
      <section className="mt-4">
        <h2 className="mb-2 text-sm font-medium text-neutral-700">README</h2>
        <ReadmeEditor value={idea.readme} onChange={(readme) => patch({ readme })} />
        <p className="mt-1.5 text-xs text-neutral-400">
          Markdown supported — write the concept, features, and what you want to build next.
        </p>
      </section>

      <ConfirmDeleteModal
        open={confirmOpen}
        ideaTitle={initial.title}
        busy={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleDelete()}
      />
      <ToastViewport toasts={toasts} />
    </div>
  )

  function goBack() {
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    router.push('/')
    router.refresh()
  }
}
