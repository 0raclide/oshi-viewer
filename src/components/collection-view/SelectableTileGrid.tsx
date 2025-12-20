'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import type { ItemSummary, ItemReference } from '@/types';
import { itemRefToId } from '@/types';

type TileSize = 'small' | 'gallery';

interface SelectableTileGridProps {
  items: ItemSummary[];
  isSelected: (ref: ItemReference) => boolean;
  onSelect: (ref: ItemReference, event?: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }) => void;
  onItemDoubleClick: (ref: ItemReference) => void;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

interface TileProps {
  item: ItemSummary;
  selected: boolean;
  size: TileSize;
  onSelect: (ref: ItemReference, event?: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }) => void;
  onDoubleClick: (ref: ItemReference) => void;
}

const sizeConfig = {
  small: { gridCols: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4', height: 'h-56', imageHeight: 'h-48' },
  gallery: { gridCols: 'grid-cols-1 max-w-lg mx-auto', height: 'h-96', imageHeight: 'h-80' },
};

const Tile = memo(function Tile({ item, selected, size, onSelect, onDoubleClick }: TileProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const config = sizeConfig[size];
  const displayName = item.smithNameRomaji || item.school || 'Unknown';
  const volumeStr = `${item.collection === 'Tokuju' ? 'T' : 'J'}${item.volume}`;

  // Build image path
  const volumePadded = String(item.volume).padStart(3, '0');
  const itemPadded = String(item.item).padStart(3, '0');
  const imagePath = `/api/image/${item.collection}/vol_${volumePadded}/item_${itemPadded}_oshigata.jpg`;

  return (
    <div
      className={`relative group rounded-lg overflow-hidden cursor-pointer transition-all bg-[var(--surface-elevated)] ${
        selected
          ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]'
          : 'hover:ring-1 hover:ring-[var(--border)]'
      }`}
      onClick={(e) => onSelect(item, { shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey })}
      onDoubleClick={() => onDoubleClick(item)}
    >
      {/* Selection checkbox */}
      <div className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
        selected
          ? 'bg-[var(--accent)] border-[var(--accent)]'
          : 'bg-[var(--surface)]/80 border-[var(--border)] opacity-0 group-hover:opacity-100'
      }`}>
        {selected && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Translation indicator */}
      {item.hasTranslation && (
        <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded bg-[var(--accent)]/90 text-[9px] font-medium text-white">
          EN
        </div>
      )}

      {/* Image with skeleton */}
      <div className={`relative ${config.imageHeight}`}>
        {/* Skeleton shimmer */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-[var(--surface)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent animate-shimmer" />
          </div>
        )}
        <Image
          src={imagePath}
          alt={displayName}
          fill
          className={`object-contain p-2 transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          sizes={size === 'gallery' ? '512px' : '(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
      </div>

      {/* Label */}
      <div className="p-2 border-t border-[var(--border)]">
        <div className="text-xs font-medium text-[var(--text-primary)] truncate">{displayName}</div>
        <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
          <span>{volumeStr}#{item.item}</span>
          {item.bladeType && <span>· {item.bladeType}</span>}
        </div>
      </div>
    </div>
  );
});

export function SelectableTileGrid({
  items,
  isSelected,
  onSelect,
  onItemDoubleClick,
  selectedCount,
  onSelectAll,
  onClearSelection,
}: SelectableTileGridProps) {
  const [size, setSize] = useState<TileSize>('small');
  const config = sizeConfig[size];

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)]">
            {items.length} items
            {selectedCount > 0 && (
              <span className="text-[var(--accent)] ml-1">({selectedCount} selected)</span>
            )}
          </span>

          {selectedCount > 0 ? (
            <button
              onClick={onClearSelection}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Clear selection
            </button>
          ) : (
            <button
              onClick={onSelectAll}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Select all
            </button>
          )}
        </div>

        {/* Size toggle */}
        <div className="flex items-center gap-1 bg-[var(--surface-elevated)] rounded p-0.5">
          <button
            onClick={() => setSize('small')}
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
              size === 'small'
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setSize('gallery')}
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
              size === 'gallery'
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Gallery
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm">
            No items match the current filters
          </div>
        ) : (
          <div className={`grid ${config.gridCols} gap-4`}>
            {items.map(item => (
              <Tile
                key={itemRefToId(item)}
                item={item}
                selected={isSelected(item)}
                size={size}
                onSelect={onSelect}
                onDoubleClick={onItemDoubleClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
