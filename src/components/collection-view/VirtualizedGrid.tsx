'use client';

import { useRef, useState, memo, useCallback, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Image from 'next/image';
import type { ItemSummary } from '@/types';
import { itemRefToId } from '@/types';

export type TileSize = 'small' | 'large';

interface VirtualizedGridProps {
  items: ItemSummary[];
  onItemClick: (item: ItemSummary) => void;
  size: TileSize;
}

interface TileProps {
  item: ItemSummary;
  size: TileSize;
  onClick: () => void;
}

// Extended item type that may include era/tradition from browse
interface ExtendedItem extends ItemSummary {
  era?: string;
  tradition?: string;
}

// Generate graceful display name based on item type and available data
function getDisplayName(item: ExtendedItem): { name: string; isAttribution: boolean } {
  // If we have a maker/smith name, use it directly
  if (item.smithNameRomaji) {
    return { name: item.smithNameRomaji, isAttribution: false };
  }

  // Fallback logic based on item type
  if (item.itemType === 'tosogu') {
    // For tosogu: "Edo tsuba" or "Muromachi kozuka"
    const type = item.fittingType || item.bladeType || 'tosogu';
    if (item.era) {
      return { name: `${item.era} ${type}`, isAttribution: true };
    }
    return { name: type, isAttribution: true };
  }

  if (item.itemType === 'koshirae') {
    // For koshirae: "Momoyama tachi koshirae"
    const mounting = item.bladeType || 'koshirae';
    if (item.era) {
      return { name: `${item.era} ${mounting}`, isAttribution: true };
    }
    return { name: mounting, isAttribution: true };
  }

  // For swords (token): prefer school, then tradition
  if (item.school) {
    return { name: item.school, isAttribution: true };
  }
  if (item.tradition) {
    return { name: `${item.tradition} tradition`, isAttribution: true };
  }
  // Last resort: era + blade type
  if (item.era && item.bladeType) {
    return { name: `${item.era} ${item.bladeType}`, isAttribution: true };
  }

  return { name: 'Unknown', isAttribution: true };
}

// Single tile component - optimized with memo
// Oshigata images are ~2:3 aspect ratio (2835x4192px), so tiles use portrait orientation
const Tile = memo(function Tile({ item, size, onClick }: TileProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { name: displayName, isAttribution } = getDisplayName(item as ExtendedItem);
  const volumeStr = `${item.collection === 'Tokuju' ? 'T' : 'J'}${item.volume}`;
  const collectionName = item.collection === 'Tokuju' ? 'Tokubetsu Juyo' : 'Juyo';

  // Build image path
  const volumePadded = String(item.volume).padStart(3, '0');
  const itemPadded = String(item.item).padStart(3, '0');
  const imagePath = `/api/image/${item.collection}/vol_${volumePadded}/item_${itemPadded}_oshigata.jpg`;

  // Keyboard handler for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${displayName}, ${item.bladeType || 'sword'}, ${collectionName} volume ${item.volume} item ${item.item}`}
      className={`
        relative group rounded-lg overflow-hidden cursor-pointer
        bg-[var(--surface-elevated)] border border-[var(--border)]
        transition-all duration-200 ease-out
        hover:border-[var(--accent)]/50 hover:shadow-lg hover:shadow-[var(--accent)]/10
        focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]
        active:scale-[0.98] flex flex-col h-full
      `}
    >

      {/* Image container - 2:3 aspect ratio matches oshigata images */}
      <div
        className="relative w-full bg-[var(--surface)]"
        style={{ aspectRatio: '2/3' }}
      >
        {/* Skeleton shimmer - shows while loading */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--border)]/50 to-transparent animate-shimmer" />
        </div>

        {!imageError && (
          <Image
            src={imagePath}
            alt={`Oshigata (sword tracing) of ${displayName}${item.bladeType ? `, ${item.bladeType}` : ''}`}
            fill
            className={`object-contain p-3 transition-all duration-300 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            sizes={size === 'large' ? '280px' : '180px'}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-xs">
            No image
          </div>
        )}
      </div>

      {/* Label - compact info bar */}
      <div className="p-2.5 border-t border-[var(--border)] bg-[var(--surface-elevated)] mt-auto">
        <div className={`text-xs font-medium truncate leading-tight ${
          isAttribution ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'
        }`}>
          {displayName}
        </div>
        <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
          <span className="font-mono">{volumeStr}#{item.item}</span>
          {!isAttribution && item.bladeType && <span className="opacity-60">· {item.bladeType}</span>}
        </div>
      </div>
    </div>
  );
});

// Responsive column count and row height based on container width and size
function useResponsiveGrid(containerRef: React.RefObject<HTMLDivElement | null>, size: TileSize) {
  const [columns, setColumns] = useState(4);
  const [rowHeight, setRowHeight] = useState(300);

  useEffect(() => {
    const updateGrid = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const padding = 32; // 16px on each side
        const gap = 16;

        let cols: number;
        // More columns for small tiles, fewer for large
        if (size === 'large') {
          if (width >= 1280) cols = 4;
          else if (width >= 1024) cols = 3;
          else if (width >= 768) cols = 2;
          else cols = 2;
        } else {
          if (width >= 1280) cols = 6;
          else if (width >= 1024) cols = 5;
          else if (width >= 768) cols = 4;
          else cols = 3;
        }

        // Calculate tile width
        const availableWidth = width - padding - (gap * (cols - 1));
        const tileWidth = availableWidth / cols;

        // Calculate row height based on 2:3 aspect ratio + label height (~56px)
        const aspectRatio = 2/3;
        const imageHeight = tileWidth / aspectRatio;
        const labelHeight = 56;
        const calculatedRowHeight = imageHeight + labelHeight + gap;

        setColumns(cols);
        setRowHeight(Math.ceil(calculatedRowHeight));
      }
    };

    const observer = new ResizeObserver(updateGrid);
    const container = containerRef.current;

    if (container) {
      observer.observe(container);
      updateGrid();
    }

    return () => observer.disconnect();
  }, [containerRef, size]);

  return { columns, rowHeight };
}

export function VirtualizedGrid({
  items,
  onItemClick,
  size,
}: VirtualizedGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { columns, rowHeight } = useResponsiveGrid(containerRef, size);
  const rowCount = Math.ceil(items.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => rowHeight, [rowHeight]),
    overscan: 3,
  });

  // Remeasure when size changes
  useEffect(() => {
    virtualizer.measure();
  }, [virtualizer, size, rowHeight]);

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div className="h-full flex flex-col" ref={containerRef}>
      {/* Virtualized Grid */}
      <div
        ref={parentRef}
        role="grid"
        aria-label={`Collection grid showing ${items.length} items`}
        className="flex-1 overflow-y-auto"
      >
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm">
            No items match the current filters
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            <div
              className="p-4"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRows[0]?.start ?? 0}px)`,
              }}
            >
              {virtualRows.map((virtualRow) => {
                const startIndex = virtualRow.index * columns;
                const rowItems = items.slice(startIndex, startIndex + columns);

                return (
                  <div
                    key={virtualRow.key}
                    role="row"
                    className="grid gap-4"
                    style={{
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                      height: rowHeight - 16, // Subtract gap
                      marginBottom: 16,
                    }}
                  >
                    {rowItems.map(item => (
                      <div key={itemRefToId(item)} role="gridcell">
                        <Tile
                          item={item}
                          size={size}
                          onClick={() => onItemClick(item)}
                        />
                      </div>
                    ))}
                    {rowItems.length < columns &&
                      Array(columns - rowItems.length).fill(0).map((_, i) => (
                        <div key={`empty-${i}`} role="gridcell" aria-hidden="true" />
                      ))
                    }
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
