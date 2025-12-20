'use client';

import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkIcon, ChevronLeftIcon, LoadingSpinner, XIcon } from '@/components/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useState, memo } from 'react';

// Bookmark card with image preview
const BookmarkCard = memo(function BookmarkCard({
  bookmark,
  onRemove
}: {
  bookmark: {
    reference: { collection: string; volume: number; item: number };
    smithName: string;
    bladeType: string;
    addedAt: string;
  };
  onRemove: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { reference } = bookmark;

  const volumePadded = String(reference.volume).padStart(3, '0');
  const itemPadded = String(reference.item).padStart(3, '0');
  const imagePath = `/api/image/${reference.collection}/vol_${volumePadded}/item_${itemPadded}_oshigata.jpg`;

  return (
    <div className="group relative elegant-card overflow-hidden card-hover">
      <Link
        href={`/item/${reference.collection}/${reference.volume}/${reference.item}`}
        className="block"
      >
        {/* Image */}
        <div className="relative h-48 bg-[var(--surface-elevated)]">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[var(--surface)]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent animate-shimmer" />
            </div>
          )}
          <Image
            src={imagePath}
            alt={bookmark.smithName}
            fill
            className={`object-contain p-3 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 768px) 50vw, 33vw"
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 mb-2">
            <BookmarkIcon className="w-4 h-4 text-[var(--accent)]" filled />
            <span className="text-sm font-medium text-[var(--text-primary)]">{bookmark.smithName}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="capitalize">{bookmark.bladeType || 'Unknown type'}</span>
            <span className="badge badge-muted">
              {reference.collection === 'Tokuju' ? 'T' : 'J'}{reference.volume}#{reference.item}
            </span>
          </div>
        </div>
      </Link>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[var(--surface)]/90 border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:border-red-400/50 opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Remove bookmark"
      >
        <XIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

export default function BookmarksPage() {
  const { bookmarks, isLoaded, removeBookmark } = useBookmarks();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-9 h-9 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-all"
              aria-label="Back to home"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
                <BookmarkIcon className="w-5 h-5 text-[var(--accent)]" filled />
                Your Bookmarks
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                {isLoaded ? `${bookmarks.length} saved item${bookmarks.length !== 1 ? 's' : ''}` : 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {!isLoaded ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner className="w-8 h-8 text-[var(--accent)]" />
            <p className="text-sm text-[var(--text-muted)] mt-4">Loading bookmarks...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-[var(--surface)] flex items-center justify-center mb-6">
              <BookmarkIcon className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">No bookmarks yet</h2>
            <p className="text-sm text-[var(--text-muted)] text-center max-w-sm mb-6">
              Items you bookmark will appear here for quick access. Browse the collection to find items to save.
            </p>
            <Link href="/" className="btn-accent">
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={`${bookmark.reference.collection}-${bookmark.reference.volume}-${bookmark.reference.item}`}
                bookmark={bookmark}
                onRemove={() => removeBookmark(bookmark.reference)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
