'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LoadingSpinner, ChevronRightIcon } from '@/components/icons';

interface VolumeInfo {
  volume: number;
  itemCount: number;
  hasTranslations: boolean;
  translatedCount: number;
}

interface CollectionIndex {
  collection: string;
  label: string;
  labelJp: string;
  description: string;
  totalVolumes: number;
  totalItems: number;
  volumesWithTranslations: number;
  itemsWithTranslations: number;
  volumes: VolumeInfo[];
}

interface IndexData {
  collections: CollectionIndex[];
  summary: {
    totalCollections: number;
    totalVolumes: number;
    totalItems: number;
    totalTranslated: number;
  };
}

export default function BrowseIndexPage() {
  const [data, setData] = useState<IndexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set(['Tokuju', 'Juyo']));

  useEffect(() => {
    fetch('/api/index')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading index:', err);
        setLoading(false);
      });
  }, []);

  const toggleCollection = (collection: string) => {
    setExpandedCollections(prev => {
      const next = new Set(prev);
      if (next.has(collection)) {
        next.delete(collection);
      } else {
        next.add(collection);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-4">
        <LoadingSpinner className="w-8 h-8 text-[var(--accent)]" />
        <p className="text-sm text-[var(--text-muted)]">Loading index...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center">
        <p className="text-[var(--text-muted)]">Failed to load index</p>
      </div>
    );
  }

  const translationPercent = Math.round((data.summary.totalTranslated / data.summary.totalItems) * 100);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2 hover:text-[var(--accent)] transition-colors">
                <span className="text-[var(--accent)] font-jp text-xl">押形</span>
                <span className="text-[var(--text-secondary)]">Oshi Viewer</span>
              </Link>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="text-[var(--text-primary)]">Catalog</span>
            </div>
            <Link
              href="/"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              Browse Items →
            </Link>
          </div>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="border-b border-[var(--border)] bg-[var(--surface-elevated)]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-light text-[var(--text-primary)]">{data.summary.totalCollections}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Collections</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-[var(--text-primary)]">{data.summary.totalVolumes}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Volumes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-[var(--text-primary)]">{data.summary.totalItems.toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-[var(--accent)]">{translationPercent}%</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Translated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Collections */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {data.collections.map(collection => {
            const isExpanded = expandedCollections.has(collection.collection);
            const translatedPercent = Math.round((collection.itemsWithTranslations / collection.totalItems) * 100);

            return (
              <div key={collection.collection} className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
                {/* Collection Header */}
                <button
                  onClick={() => toggleCollection(collection.collection)}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-[var(--surface-elevated)] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <ChevronRightIcon className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium text-[var(--text-primary)]">{collection.label}</span>
                        <span className="text-lg font-jp text-[var(--text-secondary)]">{collection.labelJp}</span>
                      </div>
                      <p className="text-sm text-[var(--text-muted)] mt-0.5">{collection.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <div className="text-[var(--text-primary)]">{collection.totalVolumes} vols</div>
                      <div className="text-[var(--text-muted)]">{collection.totalItems.toLocaleString()} items</div>
                    </div>
                    <div className="w-24">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[var(--text-muted)]">Translated</span>
                        <span className={translatedPercent === 100 ? 'text-green-400' : 'text-[var(--accent)]'}>{translatedPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${translatedPercent === 100 ? 'bg-green-400' : 'bg-[var(--accent)]'}`}
                          style={{ width: `${translatedPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>

                {/* Volumes Grid */}
                {isExpanded && (
                  <div className="border-t border-[var(--border)] px-4 py-4 bg-[var(--background)]">
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-14 gap-2">
                      {collection.volumes.map(vol => (
                        <Link
                          key={vol.volume}
                          href={`/?collection=${collection.collection}&volume=${vol.volume}`}
                          className={`group relative aspect-square rounded flex flex-col items-center justify-center text-center transition-all border ${
                            vol.hasTranslations
                              ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 hover:border-[var(--accent)]'
                              : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-elevated)] hover:border-[var(--text-muted)]'
                          }`}
                          title={`Volume ${vol.volume}: ${vol.itemCount} items${vol.hasTranslations ? ' (translated)' : ''}`}
                        >
                          <span className={`text-sm font-medium ${vol.hasTranslations ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                            {vol.volume}
                          </span>
                          <span className="text-[9px] text-[var(--text-muted)]">{vol.itemCount}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-[var(--accent)]/20 border border-[var(--accent)]/30" />
                        <span>Translated ({collection.volumesWithTranslations} vols)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-[var(--surface)] border border-[var(--border)]" />
                        <span>Not translated ({collection.totalVolumes - collection.volumesWithTranslations} vols)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Future Collections Placeholder */}
        <div className="mt-8 border border-dashed border-[var(--border)] rounded-lg p-6 text-center">
          <p className="text-[var(--text-muted)] text-sm">
            Future collections: Juyo Bijutsu-hin · Juyo Bunkazai · Kokuho · Imperial Collection
          </p>
        </div>
      </div>
    </div>
  );
}
