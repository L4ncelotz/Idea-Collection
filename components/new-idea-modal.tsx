'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
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
 * New Idea dialog — per spec: Title + Description, save immediately.
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
    setSaveError(null)
    setSaving(true)
    const { data, error } = await createIdea(createClient(), { title, description })
    if (error || !data) {
      // Keep the user's text in the form — nothing is lost on failure.
      setSaveError('Failed to save. Check your connection and try again.')
      setSaving(false)
      return
    }
    toast.success('Idea saved')
    onCreated(data)
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !saving) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Idea</DialogTitle>
          <DialogDescription>Capture it now, shape it later.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void save()
          }}
        >
          <FieldGroup>
            <Field data-invalid={titleError ? true : undefined}>
              <FieldLabel htmlFor="new-idea-title">
                Title <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="new-idea-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (titleError) setTitleError(null)
                }}
                autoFocus
                placeholder="e.g. Focus Garden"
                aria-invalid={titleError ? true : undefined}
              />
              <FieldError>{titleError}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="new-idea-description">Description</FieldLabel>
              <Textarea
                id="new-idea-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What is it? Why make it?"
              />
            </Field>

            {saveError ? <FieldError>{saveError}</FieldError> : null}
          </FieldGroup>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Spinner data-icon="inline-start" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
