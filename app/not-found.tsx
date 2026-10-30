import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl">🗄️</p>
        <h1 className="mt-3 text-lg font-semibold">Idea not found</h1>
        <p className="mt-1 text-sm text-neutral-500">
          This idea doesn&apos;t exist — or it belongs to somebody else&apos;s vault.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Back to Your Ideas
        </Link>
      </div>
    </div>
  )
}
