import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-light text-[var(--accent)] mb-4 font-jp">404</h1>
        <h2 className="text-xl text-[var(--text-primary)] mb-2">Page not found</h2>
        <p className="text-[var(--text-muted)] mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-dark)] transition-colors"
          >
            Browse collection
          </Link>
          <Link
            href="/catalog"
            className="px-4 py-2 bg-[var(--surface-elevated)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--border)] transition-colors"
          >
            View catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
