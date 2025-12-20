'use client';

import { useState, useEffect, useCallback, memo, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FilterPanel, VirtualizedGrid, type TileSize } from '@/components/collection-view';
import { useCollectionFilters } from '@/hooks/useCollectionFilters';
import { useCollections } from '@/hooks/useCollections';
import { LoadingSpinner, SearchIcon, XIcon, BookmarkIcon, ChevronLeftIcon, ListIcon } from '@/components/icons';
import type { FilterFacets, ItemSummary } from '@/types';

// Extended item type with browse-specific fields
interface BrowseItem extends ItemSummary {
  era?: string;
  tradition?: string;
  meiStatus?: string;
}

// Isolated search input component - prevents parent re-renders while typing
const SearchInput = memo(function SearchInput({
  initialValue,
  onSearch,
  onClear
}: {
  initialValue: string;
  onSearch: (query: string) => void;
  onClear: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(value);
    }
    if (e.key === 'Escape') {
      setValue('');
      onClear();
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setValue('');
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="relative group">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search smith, school, era... (Enter to search)"
        className="w-full pl-10 pr-10 py-2 text-sm bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
          aria-label="Clear search"
        >
          <XIcon className="w-3 h-3" />
        </button>
      )}
    </div>
  );
});

function BrowseContent() {
  const router = useRouter();
  const { filters, activeFilterCount, setFilter, clearFilters } = useCollectionFilters();
  const [items, setItems] = useState<BrowseItem[]>([]);
  const [facets, setFacets] = useState<FilterFacets>({
    eras: [],
    schools: [],
    traditions: [],
    bladeTypes: [],
    smiths: [],
    meiStatuses: [],
    nakagoConditions: [],
  });
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Right panel collapse state - synced with detail view's right panel
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Tile size state
  const [tileSize, setTileSize] = useState<TileSize>('small');

  // Load panel state from localStorage (sync with detail view)
  useEffect(() => {
    const saved = localStorage.getItem('oshi-right-panel-collapsed');
    if (saved === 'true') setRightPanelCollapsed(true);
  }, []);

  // Toggle right panel
  const toggleRightPanel = useCallback(() => {
    setRightPanelCollapsed(prev => {
      localStorage.setItem('oshi-right-panel-collapsed', String(!prev));
      return !prev;
    });
  }, []);

  // Collections (for bookmark count)
  const { bookmarks, isLoaded: bookmarksLoaded } = useCollections();

  // Active search query (only changes when user presses Enter)
  const [activeQuery, setActiveQuery] = useState(filters.query || '');

  // Sync with URL changes
  useEffect(() => {
    setActiveQuery(filters.query || '');
  }, [filters.query]);

  // Stable callbacks for SearchInput - update URL so query persists across filter changes
  const handleSearch = useCallback((query: string) => {
    setFilter('query', query || undefined);
  }, [setFilter]);

  const handleClearSearch = useCallback(() => {
    setFilter('query', undefined);
  }, [setFilter]);

  // Items are now filtered server-side with rich query support
  const filteredItems = items;


  // Fetch items when filters or search query change
  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams();
    // Include query for server-side rich search (field:value, comparisons, negations)
    if (filters.query?.trim()) params.set('q', filters.query.trim());
    if (filters.collection) params.set('collection', filters.collection);
    if (filters.volume) params.set('volume', String(filters.volume));
    if (filters.itemType) params.set('itemType', filters.itemType);
    if (filters.era) params.set('era', filters.era);
    if (filters.school) params.set('school', filters.school);
    if (filters.tradition) params.set('tradition', filters.tradition);
    if (filters.bladeType) params.set('bladeType', filters.bladeType);
    if (filters.smith) params.set('smith', filters.smith);
    if (filters.meiStatus) params.set('meiStatus', filters.meiStatus);
    if (filters.nakagoCondition) params.set('nakagoCondition', filters.nakagoCondition);
    if (filters.denrai) params.set('denrai', filters.denrai);
    if (filters.kiwame) params.set('kiwame', filters.kiwame);
    if (filters.isEnsemble) params.set('isEnsemble', 'true');
    if (filters.hasTranslation !== undefined) params.set('hasTranslation', String(filters.hasTranslation));

    const apiUrl = `/api/browse?${params.toString()}`;

    setLoading(true);
    fetch(apiUrl, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setFacets(data.facets || {
          eras: [],
          schools: [],
          traditions: [],
          bladeTypes: [],
          smiths: [],
          meiStatuses: [],
          nakagoConditions: [],
          denrais: [],
          kiwames: [],
        });
        setLoading(false);
        setInitialLoad(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Error fetching browse data:', err);
          setLoading(false);
          setInitialLoad(false);
        }
      });

    return () => controller.abort();
  }, [filters.query, filters.collection, filters.volume, filters.itemType, filters.era, filters.school, filters.tradition, filters.bladeType, filters.smith, filters.meiStatus, filters.nakagoCondition, filters.denrai, filters.kiwame, filters.isEnsemble, filters.hasTranslation]);

  // Navigate to item detail on click
  const handleItemClick = useCallback((item: ItemSummary) => {
    router.push(`/item/${item.collection}/${item.volume}/${item.item}`);
  }, [router]);

  // Store current filtered items in sessionStorage for item page navigation
  useEffect(() => {
    if (filteredItems.length > 0) {
      // Store minimal item references for navigation
      const itemRefs = filteredItems.map(item => ({
        collection: item.collection,
        volume: item.volume,
        item: item.item,
      }));
      sessionStorage.setItem('oshi-browse-results', JSON.stringify(itemRefs));
    }
  }, [filteredItems]);

  // Keyboard navigation: Down arrow to detail view, Right arrow to collections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        router.push('/collections');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        // Blur any focused input first
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        // Try to get last viewed item from localStorage
        const lastViewed = localStorage.getItem('oshi-last-viewed-item');
        if (lastViewed) {
          try {
            const { collection, volume, item } = JSON.parse(lastViewed);
            // Check if this item is in current results
            const inResults = filteredItems.some(
              fi => fi.collection === collection && fi.volume === volume && fi.item === item
            );
            if (inResults) {
              router.push(`/item/${collection}/${volume}/${item}`);
              return;
            }
          } catch {
            // Fall through to default
          }
        }
        // Default: go to first item in filtered list
        if (filteredItems.length > 0) {
          const first = filteredItems[0];
          router.push(`/item/${first.collection}/${first.volume}/${first.item}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, filteredItems]);

  return (
    <div className="h-screen bg-[var(--background)] flex flex-col overflow-hidden">
      {/* Header - matches detail view height and structure */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0 view-transition-header">
        <div className="px-4 py-2.5">
          {/* Grid layout for proper centering: left and right columns equal width */}
          <div className="grid grid-cols-[1fr_minmax(200px,480px)_1fr] gap-4 items-center">
            {/* Left: Logo + Status */}
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2 flex-shrink-0">
                <span className="text-[var(--accent)] font-jp">押形</span>
                <span className="hidden sm:inline font-normal text-[var(--text-secondary)]">Oshi Viewer</span>
              </h1>
              <div className="hidden lg:flex items-center gap-2 text-xs text-[var(--text-muted)] min-w-0">
                <span className="opacity-30">·</span>
                <span className="truncate">
                  {loading ? 'Loading...' : `${filteredItems.length.toLocaleString()} items`}
                </span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors flex-shrink-0"
                  >
                    <span>{activeFilterCount}</span>
                    <XIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Center: Search Bar - truly centered */}
            <div className="w-full">
              <SearchInput
                initialValue={activeQuery}
                onSearch={handleSearch}
                onClear={handleClearSearch}
              />
            </div>

            {/* Right: Actions - justify-end to align right */}
            <div className="flex items-center gap-2 justify-end">
              {/* Tile size toggle */}
              <div className="hidden sm:flex items-center gap-0.5 bg-[var(--surface-elevated)] rounded p-0.5">
                <button
                  onClick={() => setTileSize('small')}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                    tileSize === 'small'
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Small tiles"
                >
                  S
                </button>
                <button
                  onClick={() => setTileSize('large')}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                    tileSize === 'large'
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Large tiles"
                >
                  L
                </button>
              </div>

              <Link
                href="/catalog"
                className="btn-ghost p-2"
                title="Collection Catalog"
              >
                <ListIcon className="w-4 h-4" />
              </Link>

              <Link
                href="/collections"
                className="relative btn-ghost p-2"
                title="My Collections"
              >
                <BookmarkIcon className="w-4 h-4" />
                {bookmarksLoaded && bookmarks.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] flex items-center justify-center font-medium">
                    {bookmarks.length > 9 ? '9+' : bookmarks.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Two Panel Layout */}
      <div className="flex-1 flex min-h-0 relative view-transition-main">
        {/* Left: Tile Grid */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0 bg-[var(--background)]">
          {initialLoad ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <LoadingSpinner className="w-8 h-8 text-[var(--accent)]" />
              <p className="text-sm text-[var(--text-muted)]">Loading collection...</p>
            </div>
          ) : (
            <VirtualizedGrid
              items={filteredItems}
              onItemClick={handleItemClick}
              size={tileSize}
            />
          )}
        </div>

        {/* Right Panel: Filters with integrated toggle */}
        <div className="hidden lg:flex flex-shrink-0 relative">
          {/* Collapsed edge tab */}
          {rightPanelCollapsed && (
            <button
              onClick={toggleRightPanel}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-5 h-16 bg-[var(--surface)] border border-[var(--border)] border-r-0 rounded-l text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-elevated)] hover:w-6 transition-all shadow-sm"
              title="Show filters (F)"
            >
              <ChevronLeftIcon className="w-3 h-3" />
            </button>
          )}

          {/* Panel content */}
          <div
            className={`flex flex-col border-l border-[var(--border)] bg-[var(--surface)] transition-all duration-300 ease-out overflow-hidden ${
              rightPanelCollapsed ? 'w-0 border-l-0' : 'w-64 xl:w-80'
            }`}
          >
            <FilterPanel
              filters={filters}
              facets={facets}
              onFilterChange={setFilter}
              onClearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
              onCollapse={toggleRightPanel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-4">
        <div className="text-2xl font-medium text-[var(--text-primary)] flex items-center gap-2">
          <span className="text-[var(--accent)] font-jp text-3xl">押形</span>
          <span>Oshi Viewer</span>
        </div>
        <LoadingSpinner className="w-8 h-8 text-[var(--accent)]" />
        <p className="text-sm text-[var(--text-muted)]">Loading collection...</p>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
