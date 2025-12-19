'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { CollectionCard } from '@/components/CollectionCard';
import { BookmarkIcon, LoadingSpinner } from '@/components/icons';
import { useBookmarks } from '@/hooks/useBookmarks';
import Link from 'next/link';

interface CollectionData {
  id: string;
  nameJa: string;
  nameEn: string;
  description: string;
  totalVolumes: number;
  totalItems: number;
  volumesWithTranslations: number;
}

export default function HomePage() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'index' | 'bookmarks'>('index');
  const { bookmarks, isLoaded: bookmarksLoaded } = useBookmarks();

  useEffect(() => {
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => {
        setCollections(data.collections || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading collections:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-6 py-8 lg:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-medium text-[var(--text-primary)] tracking-tight">
                <span className="text-[var(--text-accent)] font-jp text-3xl lg:text-4xl">押形</span>
                <span className="ml-3 font-sans">Oshi Viewer</span>
              </h1>
              <p className="text-sm text-[var(--text-tertiary)] mt-2 tracking-wide">
                Japanese Sword Documentation Archive
              </p>
            </div>
            <SearchBar className="w-full sm:w-96" placeholder="Search by smith, school, or tradition..." />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="flex gap-1 border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab('index')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'index'
                ? 'border-[var(--accent)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            Index
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'bookmarks'
                ? 'border-[var(--accent)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <BookmarkIcon className="w-4 h-4" />
            Bookmarks
            {bookmarks.length > 0 && (
              <span className="bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-xs px-2 py-0.5 rounded-full">
                {bookmarks.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 lg:py-12">
        {activeTab === 'index' ? (
          <div className="animate-fadeIn">
            {/* Categories Section */}
            <section>
              <h2 className="section-header">
                <span className="font-jp">カテゴリ</span>
                <span className="mx-2">·</span>
                <span>Collections</span>
              </h2>

              {loading ? (
                <div className="flex justify-center py-20">
                  <LoadingSpinner className="w-10 h-10 text-[var(--accent)]" />
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 stagger-children">
                  {collections.map(collection => (
                    <CollectionCard key={collection.id} {...collection} />
                  ))}
                </div>
              )}
            </section>

            {/* Quick Stats */}
            {!loading && collections.length > 0 && (
              <section className="mt-16">
                <div className="elegant-card p-10 lg:p-12">
                  <div className="ornament-line text-xs mb-8">
                    <span className="font-jp">統計</span>
                  </div>
                  <h3 className="section-header">
                    Archive Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-8">
                    <div className="text-center">
                      <div className="text-4xl lg:text-5xl font-light text-[var(--text-primary)] tracking-tight">
                        {collections.reduce((sum, c) => sum + c.totalVolumes, 0)}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-3 uppercase tracking-[0.2em]">Volumes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl lg:text-5xl font-light text-[var(--text-primary)] tracking-tight">
                        {collections.reduce((sum, c) => sum + c.totalItems, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-3 uppercase tracking-[0.2em]">Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl lg:text-5xl font-light text-[var(--accent)] tracking-tight">
                        {collections.reduce((sum, c) => sum + c.volumesWithTranslations, 0)}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-3 uppercase tracking-[0.2em]">Translated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl lg:text-5xl font-light text-[var(--text-primary)] tracking-tight">
                        {collections.length}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-3 uppercase tracking-[0.2em]">Collections</div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* About Section */}
            <section className="mt-16 text-center">
              <div className="max-w-2xl mx-auto">
                <p className="text-[var(--text-tertiary)] text-base leading-relaxed">
                  A scholarly archive of <em className="text-[var(--text-accent)] not-italic font-jp">特別重要刀剣</em> (Tokubetsu Jūyō)
                  and <em className="text-[var(--text-accent)] not-italic font-jp">重要刀剣</em> (Jūyō) designated Japanese swords,
                  featuring original oshigata, setsumei documentation, English translations, and comprehensive metadata.
                </p>
              </div>
            </section>
          </div>
        ) : (
          /* Bookmarks Tab */
          <section className="animate-fadeIn">
            <h2 className="section-header">
              <span className="font-jp">お気に入り</span>
              <span className="mx-2">·</span>
              <span>Your Bookmarks</span>
            </h2>

            {!bookmarksLoaded ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner className="w-10 h-10 text-[var(--accent)]" />
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--surface)] flex items-center justify-center">
                  <BookmarkIcon className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <p className="text-[var(--text-tertiary)] text-lg">No bookmarks yet</p>
                <p className="text-sm text-[var(--text-muted)] mt-2 max-w-xs mx-auto">
                  Items you bookmark will appear here for quick access
                </p>
              </div>
            ) : (
              <div className="space-y-3 stagger-children">
                {bookmarks.map((bookmark, index) => (
                  <Link
                    key={index}
                    href={`/item/${bookmark.reference.collection}/${bookmark.reference.volume}/${bookmark.reference.item}`}
                    className="block elegant-card p-5 card-hover"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
                          <BookmarkIcon className="w-4 h-4 text-[var(--accent)]" filled />
                        </div>
                        <div>
                          <span className="text-[var(--text-primary)] font-medium">{bookmark.smithName}</span>
                          <span className="text-[var(--border)] mx-3">·</span>
                          <span className="text-[var(--text-secondary)] capitalize">{bookmark.bladeType}</span>
                        </div>
                      </div>
                      <span className="badge badge-muted">
                        {bookmark.reference.collection} Vol.{bookmark.reference.volume}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-xs text-[var(--text-muted)] tracking-wider">
            <span className="font-jp text-[var(--text-accent)]">押形</span>
            <span className="mx-2">·</span>
            <span>Oshi Viewer</span>
            <span className="mx-2">·</span>
            <span>Japanese Sword Documentation Archive</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
