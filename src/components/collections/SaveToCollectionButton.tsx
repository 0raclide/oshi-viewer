'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { BookmarkIcon, ChevronRightIcon, FolderIcon, PlusIcon, XIcon } from '@/components/icons';
import { useCollections } from '@/hooks/useCollections';
import type { ItemReference } from '@/types';
import { ALL_SAVED_COLLECTION_ID } from '@/types';

interface SaveToCollectionButtonProps {
  reference: ItemReference;
  smithName: string;
  bladeType: string;
}

export const SaveToCollectionButton = memo(function SaveToCollectionButton({
  reference,
  smithName,
  bladeType,
}: SaveToCollectionButtonProps) {
  const {
    collections,
    isSaved,
    isInCollection,
    toggleSave,
    addToCollection,
    removeFromCollection,
    createCollection,
    isLoaded,
  } = useCollections();

  const [showDropdown, setShowDropdown] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const saved = isSaved(reference);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setIsCreating(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  // Handle quick save (just click, no dropdown)
  const handleQuickSave = () => {
    toggleSave(reference, smithName, bladeType);
  };

  // Handle dropdown toggle
  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
    setIsCreating(false);
  };

  // Handle collection toggle
  const handleCollectionToggle = (collectionId: string) => {
    if (collectionId === ALL_SAVED_COLLECTION_ID) {
      toggleSave(reference, smithName, bladeType);
    } else if (isInCollection(reference, collectionId)) {
      removeFromCollection(reference, collectionId);
    } else {
      addToCollection(reference, collectionId, smithName, bladeType);
    }
  };

  // Handle create new collection
  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      const newCollection = createCollection(newCollectionName.trim());
      // Automatically add current item to the new collection
      addToCollection(reference, newCollection.id, smithName, bladeType);
      setNewCollectionName('');
      setIsCreating(false);
    }
  };

  if (!isLoaded) {
    return (
      <button className="btn-ghost p-2 opacity-50" disabled aria-label="Loading">
        <BookmarkIcon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Main bookmark button with dropdown trigger */}
      <div className="flex items-center">
        {/* Quick save button */}
        <button
          onClick={handleQuickSave}
          className={`btn-ghost p-2 rounded-r-none ${saved ? 'text-[var(--accent)]' : ''}`}
          aria-label={saved ? 'Remove from saved' : 'Save item'}
          title={saved ? 'Saved' : 'Save'}
        >
          <BookmarkIcon className="w-4 h-4" filled={saved} />
        </button>

        {/* Dropdown trigger */}
        <button
          ref={buttonRef}
          onClick={handleDropdownToggle}
          className={`btn-ghost px-1 py-2 rounded-l-none border-l border-[var(--border)] ${
            showDropdown ? 'bg-[var(--surface-elevated)]' : ''
          }`}
          aria-label="Save to collection"
          aria-expanded={showDropdown}
          title="Save to collection..."
        >
          <ChevronRightIcon className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-1 z-50 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg shadow-xl py-1 min-w-[200px] max-w-[280px]"
        >
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
            Save to Collection
          </div>

          {/* All Saved (always first) */}
          <button
            onClick={() => handleCollectionToggle(ALL_SAVED_COLLECTION_ID)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[var(--surface)] transition-colors"
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
              saved ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)]'
            }`}>
              {saved && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <BookmarkIcon className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" filled={saved} />
            <span className="text-xs text-[var(--text-primary)] flex-1">All Saved</span>
          </button>

          {/* User collections */}
          {collections.length > 0 && (
            <div className="border-t border-[var(--border-subtle)] mt-1 pt-1">
              {collections.map(collection => {
                const inCollection = isInCollection(reference, collection.id);
                return (
                  <button
                    key={collection.id}
                    onClick={() => handleCollectionToggle(collection.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[var(--surface)] transition-colors"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      inCollection ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)]'
                    }`}>
                      {inCollection && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <FolderIcon className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                    <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{collection.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)] tabular-nums">{collection.itemIds.length}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Create new collection */}
          <div className="border-t border-[var(--border-subtle)] mt-1 pt-1">
            {isCreating ? (
              <form onSubmit={handleCreateCollection} className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Collection name..."
                    className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewCollectionName('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewCollectionName('');
                    }}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[var(--surface)] transition-colors text-[var(--accent)]"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="text-xs">New Collection</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
