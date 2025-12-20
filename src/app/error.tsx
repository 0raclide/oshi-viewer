'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-light text-[var(--accent)] mb-4">Error</h1>
        <h2 className="text-xl text-[var(--text-primary)] mb-2">Something went wrong</h2>
        <p className="text-[var(--text-muted)] mb-6">
          An unexpected error occurred while loading this page.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-dark)] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-[var(--surface-elevated)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--border)] transition-colors"
          >
            Go home
          </Link>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)]">
              Error details
            </summary>
            <pre className="mt-2 p-4 bg-[var(--surface)] rounded-lg text-xs text-[var(--text-secondary)] overflow-auto max-h-48">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
