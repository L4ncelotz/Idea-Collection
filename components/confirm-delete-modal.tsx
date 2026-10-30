'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

interface ConfirmDeleteModalProps {
  open: boolean
  ideaTitle: string
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** Hard delete confirmation (per spec: หน้าต่างยืนยันก่อนลบ). */
export function ConfirmDeleteModal({
  open,
  ideaTitle,
  busy = false,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [typed, setTyped] = useState('')

  // Fresh confirmation every time the dialog reopens — never a stale prefix.
  useEffect(() => {
    if (!open) setTyped('')
  }, [open])

  const matches = typed.trim() === ideaTitle.trim()

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onCancel()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete idea</DialogTitle>
          <DialogDescription>
            This permanently removes the idea and its README. There is no undo.
          </DialogDescription>
        </DialogHeader>

        <p className="truncate rounded-md bg-muted px-3 py-2 text-sm font-medium">{ideaTitle}</p>

        <Field>
          <FieldLabel htmlFor="confirm-delete-title">Type the idea title to confirm</FieldLabel>
          <Input
            id="confirm-delete-title"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={ideaTitle}
            autoFocus
          />
        </Field>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={!matches || busy}
          >
            {busy ? <Spinner data-icon="inline-start" /> : null}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
