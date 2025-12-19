'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeftIcon, FilterIcon, LoadingSpinner, SearchIcon } from '@/components/icons';
import { SearchBar } from '@/components/SearchBar';
import { ItemCard } from '@/components/ItemCard';
import type { ItemSummary } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const collectionFilter = searchParams.get('collection') || '';
  const translationFilter = searchParams.get('hasTranslation') === 'true';

  const [items, setItems] = useState<(ItemSummary & { oshigataUrl: string })[]>([]);
  const [total, setTotal] = useState(0);
  const [byBladeType, setByBladeType] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ q: query });
    if (collectionFilter) params.set('collection', collectionFilter);
    if (translationFilter) params.set('hasTranslation', 'true');

    fetch(`/api/search?${params}`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setTotal(data.total || 0);
        setByBladeType(data.byBladeType || {});
        setLoading(false);
      })
      .catch(err => {
        console.error('Search error:', err);
        setLoading(false);
      });
  }, [query, collectionFilter, translationFilter]);

  // Build blade type summary
  const bladeTypeStats = Object.entries(byBladeType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `${count} ${type.charAt(0).toUpperCase() + type.slice(1)}`)
    .join(' · ');

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="w-10 h-10 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-all duration-300"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Link>
            <SearchBar initialQuery={query} className="flex-1 max-w-2xl" />
            <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all duration-300">
              <FilterIcon className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Results header */}
      {query && !loading && (
        <div className="border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[var(--text-primary)] font-medium">{total}</span>
                <span className="text-[var(--text-secondary)]"> results for </span>
                <span className="text-[var(--text-accent)]">&quot;{query}&quot;</span>
              </div>
            </div>
            {bladeTypeStats && (
              <p className="text-xs text-[var(--text-muted)] mt-2 tracking-wide">{bladeTypeStats}</p>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {!query ? (
          <div className="text-center py-20 animate-fadeIn">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--surface)] flex items-center justify-center">
              <SearchIcon className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-tertiary)] text-lg">Enter a search term to find items</p>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Search by smith name, school, tradition, or blade type
            </p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner className="w-10 h-10 text-[var(--accent)]" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 animate-fadeIn">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--surface)] flex items-center justify-center">
              <SearchIcon className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-tertiary)] text-lg">No items found for &quot;{query}&quot;</p>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 stagger-children">
              {items.map(item => (
                <ItemCard
                  key={`${item.collection}-${item.volume}-${item.item}`}
                  item={item}
                  showCollection={true}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <LoadingSpinner className="w-10 h-10 text-[var(--accent)]" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
