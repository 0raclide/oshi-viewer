'use client';

import { useState, useCallback, useEffect, useMemo, memo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCollections } from '@/hooks/useCollections';
import { CollectionsPanel } from '@/components/collections/CollectionsPanel';
import { BookmarkIcon, ChevronLeftIcon, LoadingSpinner, XIcon, ChevronRightIcon } from '@/components/icons';
import { ALL_SAVED_COLLECTION_ID } from '@/types';
import type { Bookmark } from '@/types';

// Saved item card with image preview
const SavedItemCard = memo(function SavedItemCard({
  bookmark,
  onRemove,
  collectionId,
}: {
  bookmark: Bookmark;
  onRemove: () => void;
  collectionId: string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { reference } = bookmark;

  const volumePadded = String(reference.volume).padStart(3, '0');
  const itemPadded = String(reference.item).padStart(3, '0');
  const imagePath = `/api/image/${reference.collection}/vol_${volumePadded}/item_${itemPadded}_oshigata.jpg`;

  const isAllSaved = collectionId === ALL_SAVED_COLLECTION_ID;

  return (
    <div className="group relative rounded-lg overflow-hidden bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--accent)]/50 hover:shadow-lg hover:shadow-[var(--accent)]/10 transition-all">
      <Link
        href={`/item/${reference.collection}/${reference.volume}/${reference.item}`}
        className="block"
      >
        {/* Image - 2:3 aspect ratio */}
        <div className="relative w-full bg-[var(--surface)]" style={{ aspectRatio: '2/3' }}>
          {!imageLoaded && (
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--border)]/50 to-transparent animate-shimmer" />
            </div>
          )}
          <Image
            src={imagePath}
            alt={bookmark.smithName || 'Saved item'}
            fill
            className={`object-contain p-3 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="p-2.5 border-t border-[var(--border)]">
          <div className="text-xs font-medium text-[var(--text-primary)] truncate">
            {bookmark.smithName || 'Unknown'}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
            <span className="font-mono">
              {reference.collection === 'Tokuju' ? 'T' : 'J'}{reference.volume}#{reference.item}
            </span>
            {bookmark.bladeType && <span className="opacity-60">· {bookmark.bladeType}</span>}
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
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--surface)]/90 border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:border-red-400/50 opacity-0 group-hover:opacity-100 transition-all"
        aria-label={isAllSaved ? 'Remove from All Saved' : 'Remove from collection'}
        title={isAllSaved ? 'Unsave item' : 'Remove from this collection'}
      >
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
});

function CollectionsContent() {
  const router = useRouter();
  const {
    collections,
    bookmarks,
    isLoaded,
    createCollection,
    deleteCollection,
    renameCollection,
    unsaveItem,
    removeFromCollection,
    getCollectionItems,
  } = useCollections();

  // Selected collection state
  const [selectedCollectionId, setSelectedCollectionId] = useState(ALL_SAVED_COLLECTION_ID);

  // Right panel collapse state
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Get items for selected collection
  const displayItems = getCollectionItems(selectedCollectionId);

  // Store collection items in sessionStorage for item page navigation
  useEffect(() => {
    if (displayItems.length > 0) {
      const itemRefs = displayItems.map(bookmark => ({
        collection: bookmark.reference.collection,
        volume: bookmark.reference.volume,
        item: bookmark.reference.item,
      }));
      sessionStorage.setItem('oshi-browse-results', JSON.stringify(itemRefs));
    }
  }, [displayItems]);

  // Get selected collection info
  const selectedCollection = selectedCollectionId === ALL_SAVED_COLLECTION_ID
    ? null
    : collections.find(c => c.id === selectedCollectionId);

  const collectionName = selectedCollectionId === ALL_SAVED_COLLECTION_ID
    ? 'All Saved'
    : selectedCollection?.name || 'Collection';

  // Handle remove item
  const handleRemoveItem = useCallback((bookmark: Bookmark) => {
    if (selectedCollectionId === ALL_SAVED_COLLECTION_ID) {
      // Remove from All Saved = unsave completely
      unsaveItem(bookmark.reference);
    } else {
      // Remove from specific collection only
      removeFromCollection(bookmark.reference, selectedCollectionId);
    }
  }, [selectedCollectionId, unsaveItem, removeFromCollection]);

  // Toggle panel
  const toggleRightPanel = useCallback(() => {
    setRightPanelCollapsed(prev => !prev);
  }, []);

  // Build list of all collection IDs (All Saved + user collections)
  const allCollectionIds = useMemo(
    () => [ALL_SAVED_COLLECTION_ID, ...collections.map(c => c.id)],
    [collections]
  );

  // Keyboard navigation: Left arrow to browse, Up/Down to navigate collections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        router.push('/');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = allCollectionIds.indexOf(selectedCollectionId);
        if (currentIndex > 0) {
          setSelectedCollectionId(allCollectionIds[currentIndex - 1]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = allCollectionIds.indexOf(selectedCollectionId);
        if (currentIndex < allCollectionIds.length - 1) {
          setSelectedCollectionId(allCollectionIds[currentIndex + 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, allCollectionIds, selectedCollectionId]);

  return (
    <div className="h-screen bg-[var(--background)] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-all"
                aria-label="Back to browse"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <BookmarkIcon className="w-4 h-4 text-[var(--accent)]" filled />
                  {collectionName}
                </h1>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {isLoaded ? `${displayItems.length} item${displayItems.length !== 1 ? 's' : ''}` : 'Loading...'}
                </p>
              </div>
            </div>

            {/* Right: Show panel button (mobile) */}
            <button
              onClick={toggleRightPanel}
              className="lg:hidden btn-ghost p-2"
              aria-label="Toggle collections panel"
            >
              <ChevronRightIcon className={`w-4 h-4 transition-transform ${rightPanelCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left: Item Grid */}
        <div className="flex-1 min-w-0 overflow-y-auto p-4">
          {!isLoaded ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <LoadingSpinner className="w-8 h-8 text-[var(--accent)]" />
              <p className="text-sm text-[var(--text-muted)]">Loading collections...</p>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center mb-4">
                <BookmarkIcon className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
              <h2 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                {selectedCollectionId === ALL_SAVED_COLLECTION_ID ? 'No saved items yet' : 'Collection is empty'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] text-center max-w-xs mb-4">
                {selectedCollectionId === ALL_SAVED_COLLECTION_ID
                  ? 'Items you save will appear here. Browse the collection to find items to save.'
                  : 'Add items to this collection from the item detail view.'}
              </p>
              <Link href="/" className="text-xs text-[var(--accent)] hover:underline">
                Browse Collection
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {displayItems.map((bookmark) => (
                <SavedItemCard
                  key={`${bookmark.reference.collection}-${bookmark.reference.volume}-${bookmark.reference.item}`}
                  bookmark={bookmark}
                  onRemove={() => handleRemoveItem(bookmark)}
                  collectionId={selectedCollectionId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Collections */}
        <div className="hidden lg:flex flex-shrink-0 relative">
          {/* Collapsed edge tab */}
          {rightPanelCollapsed && (
            <button
              onClick={toggleRightPanel}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-5 h-16 bg-[var(--surface)] border border-[var(--border)] border-r-0 rounded-l text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-elevated)] hover:w-6 transition-all shadow-sm"
              title="Show collections"
            >
              <ChevronLeftIcon className="w-3 h-3" />
            </button>
          )}

          {/* Panel content */}
          <div
            className={`flex flex-col border-l border-[var(--border)] bg-[var(--surface)] transition-all duration-300 ease-out overflow-hidden ${
              rightPanelCollapsed ? 'w-0 border-l-0' : 'w-64'
            }`}
          >
            <CollectionsPanel
              collections={collections}
              bookmarkCount={bookmarks.length}
              selectedCollectionId={selectedCollectionId}
              onSelectCollection={setSelectedCollectionId}
              onCreateCollection={createCollection}
              onDeleteCollection={deleteCollection}
              onRenameCollection={renameCollection}
              onCollapse={toggleRightPanel}
            />
          </div>
        </div>

        {/* Mobile: Slide-out panel */}
        {!rightPanelCollapsed && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={toggleRightPanel}
            />
            {/* Panel */}
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-[var(--surface)] border-l border-[var(--border)] shadow-xl">
              <CollectionsPanel
                collections={collections}
                bookmarkCount={bookmarks.length}
                selectedCollectionId={selectedCollectionId}
                onSelectCollection={(id) => {
                  setSelectedCollectionId(id);
                  setRightPanelCollapsed(true);
                }}
                onCreateCollection={createCollection}
                onDeleteCollection={deleteCollection}
                onRenameCollection={renameCollection}
                onCollapse={toggleRightPanel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-4">
        <LoadingSpinner className="w-8 h-8 text-[var(--accent)]" />
        <p className="text-sm text-[var(--text-muted)]">Loading collections...</p>
      </div>
    }>
      <CollectionsContent />
    </Suspense>
  );
}
