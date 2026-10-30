'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { markdown } from '@codemirror/lang-markdown'
import { Eye, PencilLine } from 'lucide-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// CodeMirror touches window APIs — keep it client-only.
const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
  ssr: false,
  loading: () => (
    <div className="h-[55vh] animate-pulse rounded-b-2xl bg-neutral-100" aria-hidden="true" />
  ),
})

type Tab = 'edit' | 'preview'

interface ReadmeEditorProps {
  value: string
  onChange: (next: string) => void
}

/**
 * README editing surface: Markdown editor + live Preview toggle (per spec).
 * Kept as its own unit so the detail page stays readable.
 */
export function ReadmeEditor({ value, onChange }: ReadmeEditorProps) {
  const [tab, setTab] = useState<Tab>('edit')

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {/* Tab strip */}
      <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-3 py-2">
        <TabButton active={tab === 'edit'} onClick={() => setTab('edit')} icon={<PencilLine size={14} />}>
          Edit
        </TabButton>
        <TabButton active={tab === 'preview'} onClick={() => setTab('preview')} icon={<Eye size={14} />}>
          Preview
        </TabButton>
        <span className="ml-auto text-xs text-neutral-400">README.md</span>
      </div>

      {tab === 'edit' ? (
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={[markdown()]}
          theme="light"
          height="55vh"
          basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: true }}
        />
      ) : (
        <div className="markdown-preview h-[55vh] overflow-y-auto px-5 py-4">
          {value.trim() ? (
            <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
          ) : (
            <p className="italic text-neutral-400">Nothing written yet — switch to Edit to start.</p>
          )}
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
