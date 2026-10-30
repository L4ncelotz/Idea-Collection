'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal'
import { ReadmeEditor } from '@/components/readme-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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
      toast.error('Save failed — check your connection and try again')
      return
    }
    setIdea(data)
    toast.success('Saved')
    router.refresh() // keeps the surrounding page data honest
  }

  async function handleDelete() {
    setDeleting(true)
    const { error } = await deleteIdea(createClient(), idea.id)
    if (error) {
      setDeleting(false)
      setConfirmOpen(false)
      toast.error('Delete failed — try again in a moment')
      return
    }
    toast.success('Idea deleted')
    router.push('/')
    router.refresh()
  }

  return (
    <div className="pb-20">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" onClick={goBack} variant="ghost" size="sm">
          <ArrowLeft data-icon="inline-start" />
          Your Ideas
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setConfirmOpen(true)}
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
          <Button
            type="button"
            onClick={() => void save()}
            disabled={!canSave}
            title={!canSave ? 'Nothing to save (or title is invalid)' : 'Save changes'}
          >
            {saving ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
            Save
            {dirty ? <span className="size-1.5 rounded-full bg-amber-500" /> : null}
          </Button>
        </div>
      </div>

      {/* Meta line */}
      <div className="mt-1.5 flex items-center gap-2 pl-2.5 text-xs text-muted-foreground">
        <span>Created {formatUpdatedAt(initial.created_at)}</span>
        {formatUpdatedAt(initial.created_at) !== formatUpdatedAt(idea.updated_at) ? (
          <>
            <span>·</span>
            <span>Updated {formatUpdatedAt(idea.updated_at)}</span>
          </>
        ) : null}
      </div>

      {/* Fields */}
      <Card className="mt-4">
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!titleCheck.ok ? true : undefined}>
              <FieldLabel htmlFor="detail-title" className="text-xs text-muted-foreground uppercase">
                Title
              </FieldLabel>
              <Input
                id="detail-title"
                value={idea.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Project title"
                aria-invalid={!titleCheck.ok ? true : undefined}
                className="h-10 text-base font-semibold tracking-tight"
              />
              <FieldError>{titleCheck.ok ? null : titleCheck.error}</FieldError>
            </Field>

            <Field>
              <FieldLabel
                htmlFor="detail-description"
                className="text-xs text-muted-foreground uppercase"
              >
                Description
              </FieldLabel>
              <Textarea
                id="detail-description"
                value={idea.description}
                onChange={(e) => patch({ description: e.target.value })}
                rows={2}
                placeholder="What is it? Why make it?"
                className="resize-none"
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs text-muted-foreground uppercase">Status</FieldLabel>
              <ToggleGroup
                type="single"
                value={idea.status}
                onValueChange={(next) => {
                  if (next) patch({ status: next as IdeaStatus })
                }}
                variant="outline"
                aria-label="Status"
              >
                {(Object.keys(STATUS_META) as IdeaStatus[]).map((status) => (
                  <ToggleGroupItem
                    key={status}
                    value={status}
                    className={
                      idea.status === status
                        ? `${STATUS_META[status].badge} border-transparent`
                        : 'text-muted-foreground'
                    }
                  >
                    {status}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* README */}
      <section className="mt-4">
        <h2 className="mb-2 text-sm font-medium">README</h2>
        <ReadmeEditor value={idea.readme} onChange={(readme) => patch({ readme })} />
        <p className="mt-1.5 text-xs text-muted-foreground">
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
    </div>
  )

  function goBack() {
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    router.push('/')
    router.refresh()
  }
}
