'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, LoadingSpinner } from '@/components/icons';
import { SearchBar } from '@/components/SearchBar';
import type { VolumeInfo, Collection } from '@/types';

interface CollectionPageProps {
  params: Promise<{ collection: string }>;
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const { collection } = use(params);
  const [volumes, setVolumes] = useState<VolumeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const collectionNameJa = collection === 'Tokuju' ? '特別重要刀剣' : '重要刀剣';
  const collectionNameEn = collection === 'Tokuju' ? 'Tokubetsu Jūyō' : 'Jūyō';

  useEffect(() => {
    fetch(`/api/volumes/${collection}`)
      .then(res => res.json())
      .then(data => {
        setVolumes(data.volumes || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading volumes:', err);
        setLoading(false);
      });
  }, [collection]);

  const totalItems = volumes.reduce((sum, v) => sum + v.itemCount, 0);
  const translatedVolumes = volumes.filter(v => v.hasTranslations).length;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Link
              href="/"
              className="w-10 h-10 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-all duration-300 self-start"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-medium text-[var(--text-primary)] tracking-tight">
                <span className="text-[var(--text-accent)] font-jp text-3xl lg:text-4xl">{collectionNameJa}</span>
                <span className="ml-3 text-xl lg:text-2xl font-sans">{collectionNameEn}</span>
              </h1>
              <div className="flex items-center gap-4 mt-3">
                <span className="badge badge-muted">{volumes.length} volumes</span>
                <span className="badge badge-muted">{totalItems.toLocaleString()} items</span>
                {translatedVolumes > 0 && (
                  <span className="badge badge-gold">{translatedVolumes} translated</span>
                )}
              </div>
            </div>
            <SearchBar className="w-full md:w-72" placeholder={`Search ${collectionNameEn}...`} />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="section-header">
          <span className="font-jp">巻</span>
          <span className="mx-2">·</span>
          <span>Volumes</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner className="w-10 h-10 text-[var(--accent)]" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 stagger-children">
            {volumes.map(vol => (
              <Link
                key={vol.volume}
                href={`/collection/${collection}/${vol.volume}`}
                className="block elegant-card p-5 card-hover group"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-medium text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                      <span className="font-jp text-[var(--text-accent)]">第{vol.volume}巻</span>
                      <span className="text-sm text-[var(--text-muted)] ml-2">Vol. {vol.volume}</span>
                    </h3>
                    <p className="text-sm text-[var(--text-tertiary)]">
                      {vol.itemCount} items
                    </p>
                    {vol.hasTranslations && (
                      <span className="badge badge-gold text-[10px]">
                        Translations
                      </span>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center group-hover:bg-[var(--accent)] transition-colors">
                    <ChevronRightIcon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-black transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
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
