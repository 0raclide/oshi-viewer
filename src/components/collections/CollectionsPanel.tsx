'use client';

import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { BookmarkIcon, FolderIcon, PlusIcon, MoreIcon, TrashIcon, EditIcon, XIcon, ChevronLeftIcon } from '@/components/icons';
import type { UserCollection } from '@/types';
import { ALL_SAVED_COLLECTION_ID } from '@/types';

interface CollectionsPanelProps {
  collections: UserCollection[];
  bookmarkCount: number;
  selectedCollectionId: string;
  onSelectCollection: (id: string) => void;
  onCreateCollection: (name: string) => void;
  onDeleteCollection: (id: string) => void;
  onRenameCollection: (id: string, name: string) => void;
  onCollapse?: () => void;
}

// Collection item in the list
const CollectionItem = memo(function CollectionItem({
  collection,
  isSelected,
  onSelect,
  onDelete,
  onRename,
}: {
  collection: UserCollection;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(collection.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  // Focus input when renaming
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== collection.name) {
      onRename(renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setRenameValue(collection.name);
      setIsRenaming(false);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={onSelect}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
          isSelected
            ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
        }`}
      >
        <FolderIcon className="w-4 h-4 flex-shrink-0" />
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-[var(--surface)] border border-[var(--accent)] rounded px-1.5 py-0.5 text-xs text-[var(--text-primary)] focus:outline-none"
          />
        ) : (
          <>
            <span className="flex-1 text-xs font-medium truncate">{collection.name}</span>
            <span className={`text-[10px] tabular-nums ${isSelected ? 'text-[var(--accent)]/70' : 'text-[var(--text-muted)]'}`}>
              {collection.itemIds.length}
            </span>
          </>
        )}
      </button>

      {/* More menu button - appears on hover */}
      {!isRenaming && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-all ${
            showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <MoreIcon className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Dropdown menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 z-20 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[120px]"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
              setIsRenaming(true);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]"
          >
            <EditIcon className="w-3.5 h-3.5" />
            Rename
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-[var(--surface)]"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
});

// Create collection inline form
const CreateCollectionForm = memo(function CreateCollectionForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2">
      <FolderIcon className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Collection name..."
        className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
        }}
      />
      <button
        type="button"
        onClick={onCancel}
        className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <XIcon className="w-3.5 h-3.5" />
      </button>
    </form>
  );
});

export function CollectionsPanel({
  collections,
  bookmarkCount,
  selectedCollectionId,
  onSelectCollection,
  onCreateCollection,
  onDeleteCollection,
  onRenameCollection,
  onCollapse,
}: CollectionsPanelProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = useCallback((name: string) => {
    onCreateCollection(name);
    setIsCreating(false);
  }, [onCreateCollection]);

  return (
    <nav className="h-full w-full flex flex-col bg-[var(--surface)]" role="navigation" aria-label="Collections">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] flex-shrink-0">
        <h2 className="text-sm font-medium text-[var(--text-primary)]">Collections</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreating(true)}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-elevated)] transition-all"
            title="New collection"
            aria-label="Create new collection"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
          {onCollapse && (
            <button
              onClick={onCollapse}
              aria-label="Hide collections panel"
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-elevated)] transition-all"
              title="Hide collections"
            >
              <ChevronLeftIcon className="w-4 h-4 rotate-180" />
            </button>
          )}
        </div>
      </div>

      {/* Collections List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* All Saved - always first */}
        <button
          onClick={() => onSelectCollection(ALL_SAVED_COLLECTION_ID)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
            selectedCollectionId === ALL_SAVED_COLLECTION_ID
              ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
          }`}
        >
          <BookmarkIcon className="w-4 h-4 flex-shrink-0" filled={selectedCollectionId === ALL_SAVED_COLLECTION_ID} />
          <span className="flex-1 text-xs font-medium">All Saved</span>
          <span className={`text-[10px] tabular-nums ${
            selectedCollectionId === ALL_SAVED_COLLECTION_ID ? 'text-[var(--accent)]/70' : 'text-[var(--text-muted)]'
          }`}>
            {bookmarkCount}
          </span>
        </button>

        {/* Separator */}
        {collections.length > 0 && (
          <div className="border-t border-[var(--border-subtle)] my-2" />
        )}

        {/* User Collections */}
        {collections.map(collection => (
          <CollectionItem
            key={collection.id}
            collection={collection}
            isSelected={selectedCollectionId === collection.id}
            onSelect={() => onSelectCollection(collection.id)}
            onDelete={() => onDeleteCollection(collection.id)}
            onRename={(name) => onRenameCollection(collection.id, name)}
          />
        ))}

        {/* Create form */}
        {isCreating && (
          <CreateCollectionForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        )}

        {/* Empty state */}
        {collections.length === 0 && !isCreating && (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-[var(--text-muted)] mb-2">
              Create collections to organize your saved items
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              + New Collection
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)]">
        {collections.length} collection{collections.length !== 1 ? 's' : ''}
      </div>
    </nav>
  );
}
