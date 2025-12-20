'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CollectionFilters, Collection, ItemType } from '@/types';

/**
 * Hook for managing collection view filters with URL sync
 * Filters are stored in URL params for shareability
 */
export function useCollectionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse filters from URL
  const filters: CollectionFilters = useMemo(() => {
    const volumeStr = searchParams.get('volume');
    const volumeNum = volumeStr ? parseInt(volumeStr, 10) : NaN;

    return {
      query: searchParams.get('q') || undefined,
      collection: searchParams.get('collection') as Collection | undefined,
      volume: !isNaN(volumeNum) ? volumeNum : undefined,
      itemType: searchParams.get('itemType') as ItemType | undefined,
      era: searchParams.get('era') || undefined,
      school: searchParams.get('school') || undefined,
      tradition: searchParams.get('tradition') || undefined,
      bladeType: searchParams.get('bladeType') || undefined,
      smith: searchParams.get('smith') || undefined,
      meiStatus: searchParams.get('meiStatus') || undefined,
      nakagoCondition: searchParams.get('nakagoCondition') || undefined,
      denrai: searchParams.get('denrai') || undefined,
      kiwame: searchParams.get('kiwame') || undefined,
      isEnsemble: searchParams.get('isEnsemble') === 'true' ? true : undefined,
      hasTranslation: searchParams.get('hasTranslation') === 'true' ? true :
                      searchParams.get('hasTranslation') === 'false' ? false : undefined,
    };
  }, [searchParams]);

  // Count active filters (excluding search query which is displayed separately)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.collection) count++;
    if (filters.volume !== undefined) count++;
    if (filters.itemType) count++;
    if (filters.era) count++;
    if (filters.school) count++;
    if (filters.tradition) count++;
    if (filters.bladeType) count++;
    if (filters.smith) count++;
    if (filters.meiStatus) count++;
    if (filters.nakagoCondition) count++;
    if (filters.denrai) count++;
    if (filters.kiwame) count++;
    if (filters.isEnsemble === true) count++;
    if (filters.hasTranslation === true) count++; // Only count true, not false
    return count;
  }, [filters]);

  // Update a single filter
  const setFilter = useCallback(<K extends keyof CollectionFilters>(
    key: K,
    value: CollectionFilters[K]
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    // Map 'query' to 'q' in URL for cleaner URLs
    const urlKey = key === 'query' ? 'q' : key;

    if (value === undefined || value === '' || value === null) {
      params.delete(urlKey);
    } else {
      params.set(urlKey, String(value));
    }

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/', { scroll: false });
  }, [router, searchParams]);

  // Update multiple filters at once
  const setFilters = useCallback((newFilters: Partial<CollectionFilters>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      const urlKey = key === 'query' ? 'q' : key;
      if (value === undefined || value === '' || value === null) {
        params.delete(urlKey);
      } else {
        params.set(urlKey, String(value));
      }
    });

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/', { scroll: false });
  }, [router, searchParams]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push('/', { scroll: false });
  }, [router]);

  // Toggle a filter value (for multi-select scenarios)
  const toggleFilter = useCallback(<K extends keyof CollectionFilters>(
    key: K,
    value: CollectionFilters[K]
  ) => {
    if (filters[key] === value) {
      setFilter(key, undefined);
    } else {
      setFilter(key, value);
    }
  }, [filters, setFilter]);

  return {
    filters,
    activeFilterCount,
    setFilter,
    setFilters,
    clearFilters,
    toggleFilter,
  };
}
