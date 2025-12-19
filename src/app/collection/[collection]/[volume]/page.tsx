'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, LoadingSpinner } from '@/components/icons';
import { ItemCard } from '@/components/ItemCard';
import type { ItemSummary, Collection } from '@/types';

interface VolumePageProps {
  params: Promise<{ collection: string; volume: string }>;
}

export default function VolumePage({ params }: VolumePageProps) {
  const { collection, volume } = use(params);
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const volumeNum = parseInt(volume, 10);
  const collectionNameJa = collection === 'Tokuju' ? '特別重要' : '重要';
  const collectionNameEn = collection === 'Tokuju' ? 'Tokubetsu Jūyō' : 'Jūyō';

  useEffect(() => {
    fetch(`/api/items/${collection}/${volume}`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading items:', err);
        setLoading(false);
      });
  }, [collection, volume]);

  // Group items by blade type for stats
  const bladeTypeCounts: Record<string, number> = {};
  items.forEach(item => {
    const bt = item.bladeType || 'unknown';
    bladeTypeCounts[bt] = (bladeTypeCounts[bt] || 0) + 1;
  });

  const bladeTypeStats = Object.entries(bladeTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `${count} ${type}`)
    .join(' · ');

  const translatedCount = items.filter(i => i.hasTranslation).length;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start gap-5">
            <Link
              href={`/collection/${collection}`}
              className="w-10 h-10 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-all duration-300"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl lg:text-3xl font-medium text-[var(--text-primary)] tracking-tight">
                  <span className="text-[var(--text-accent)] font-jp">{collectionNameJa}</span>
                  <span className="ml-2">{collectionNameEn}</span>
                </h1>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="text-xl lg:text-2xl font-jp text-[var(--text-accent)]">第{volumeNum}巻</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="badge badge-muted">{items.length} items</span>
                {translatedCount > 0 && (
                  <span className="badge badge-gold">{translatedCount} translated</span>
                )}
              </div>
              {bladeTypeStats && (
                <p className="text-xs text-[var(--text-muted)] mt-3 tracking-wide">{bladeTypeStats}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="section-header">
          <span className="font-jp">刀剣</span>
          <span className="mx-2">·</span>
          <span>Items</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner className="w-10 h-10 text-[var(--accent)]" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 animate-fadeIn">
            <p className="text-[var(--text-tertiary)] text-lg">No items found in this volume</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 stagger-children">
              {items.map(item => (
                <ItemCard
                  key={`${item.collection}-${item.volume}-${item.item}`}
                  item={item}
                  showCollection={false}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-xs text-[var(--text-muted)] tracking-wider">
            <span className="font-jp text-[var(--text-accent)]">押形</span>
            <span className="mx-2">·</span>
            <span>Oshi Viewer</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
