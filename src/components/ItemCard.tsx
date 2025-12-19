'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ItemSummary } from '@/types';

interface ItemCardProps {
  item: ItemSummary & { oshigataUrl?: string };
  showCollection?: boolean;
}

export function ItemCard({ item, showCollection = true }: ItemCardProps) {
  const volStr = String(item.volume).padStart(3, '0');
  const itemStr = String(item.item).padStart(3, '0');
  const oshigataUrl = item.oshigataUrl || `/api/image/${item.collection}/vol_${volStr}/item_${itemStr}_oshigata.jpg`;

  // Show school as fallback when author is unknown
  const hasKnownAuthor = item.smithNameRomaji && item.smithNameRomaji !== 'Unknown';
  const displayName = hasKnownAuthor
    ? item.smithNameRomaji
    : (item.school || item.smithNameKanji || 'Unknown');
  const nagasaDisplay = item.nagasa ? `${item.nagasa} cm` : '';
  const isTosoguOrKoshirae = item.itemType === 'tosogu' || item.itemType === 'koshirae';

  return (
    <Link
      href={`/item/${item.collection}/${item.volume}/${item.item}`}
      className="group block elegant-card overflow-hidden card-hover"
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] bg-gradient-to-b from-[#0d0c0b] to-[#1a1918] overflow-hidden">
        <Image
          src={oshigataUrl}
          alt={`${displayName} oshigata`}
          fill
          className="object-contain p-2 group-hover:scale-[1.02] transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* Subtle vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Smith name kanji overlay - only show if author is known */}
        {item.smithNameKanji && hasKnownAuthor && (
          <div className="absolute top-2 left-2 writing-vertical text-[var(--text-accent)] text-xs font-medium font-jp drop-shadow-lg bg-black/40 backdrop-blur-sm px-1 py-1.5 rounded">
            {item.smithNameKanji}
          </div>
        )}

        {/* Item type badge for tosogu/koshirae */}
        {isTosoguOrKoshirae && (
          <div className="absolute bottom-2 left-2 badge badge-muted text-[9px]">
            {item.itemType}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <div className="font-medium text-[var(--text-primary)] truncate text-xs">
          {displayName}
        </div>
        <div className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1.5">
          {item.bladeType && <span className="capitalize">{item.bladeType}</span>}
          {nagasaDisplay && (
            <>
              <span className="text-[var(--border)]">·</span>
              <span>{nagasaDisplay}</span>
            </>
          )}
        </div>
        {showCollection && (
          <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
            {item.collection === 'Tokuju' ? 'Tokuju' : 'Jūyō'} · Vol.{item.volume}
          </div>
        )}
      </div>
    </Link>
  );
}
