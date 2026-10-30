'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { markdown } from '@codemirror/lang-markdown'
import { Eye, PencilLine } from 'lucide-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// CodeMirror touches window APIs — keep it client-only.
const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
  ssr: false,
  loading: () => <div className="h-[55vh] animate-pulse bg-muted" aria-hidden="true" />,
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
    <div className="overflow-hidden rounded-xl border bg-card">
      <Tabs value={tab} onValueChange={(next) => setTab(next as Tab)} className="gap-0">
        <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-2 py-1.5">
          <TabsList variant="line">
            <TabsTrigger value="edit" className="text-xs">
              <PencilLine data-icon="inline-start" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              <Eye data-icon="inline-start" />
              Preview
            </TabsTrigger>
          </TabsList>
          <span className="pr-1 text-xs text-muted-foreground">README.md</span>
        </div>

        <TabsContent value="edit">
          <CodeMirror
            value={value}
            onChange={onChange}
            extensions={[markdown()]}
            theme="light"
            height="55vh"
            basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: true }}
          />
        </TabsContent>

        <TabsContent value="preview">
          <div className="markdown-preview h-[55vh] overflow-y-auto px-5 py-4">
            {value.trim() ? (
              <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
            ) : (
              <p className="italic text-muted-foreground">
                Nothing written yet — switch to Edit to start.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
