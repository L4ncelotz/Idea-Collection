'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/components/modal'

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

  // Fresh confirmation every time the modal reopens — never a stale prefix.
  useEffect(() => {
    if (!open) setTyped('')
  }, [open])

  const matches = typed.trim() === ideaTitle.trim()

  return (
    <Modal open={open} onClose={onCancel} title="Delete idea" closeOnBackdrop={!busy}>
      <p className="text-sm text-neutral-600">
        This permanently removes the idea and its README. There is no undo.
      </p>
      <p className="mt-3 truncate rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium">{ideaTitle}</p>

      <label htmlFor="confirm-delete-title" className="mt-4 block text-xs text-neutral-500">
        Type the idea title to confirm
      </label>
      <input
        id="confirm-delete-title"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder={ideaTitle}
        autoFocus
        className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-200"
      />

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-full px-4 py-2 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!matches || busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Delete
        </button>
      </div>
    </Modal>
  )
}
