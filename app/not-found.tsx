import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        <p className="text-5xl">🗄️</p>
        <h1 className="mt-3 text-lg font-semibold">Idea not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This idea doesn&apos;t exist — or it belongs to somebody else&apos;s vault.
        </p>
        <Button asChild className="mt-5">
          <Link href="/">Back to Your Ideas</Link>
        </Button>
      </div>
    </div>
  )
}
