'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface BrowseResultItem {
  collection: string;
  volume: number;
  item: number;
}

interface NavigationState {
  browseResults: BrowseResultItem[];
  currentIndex: number;
  hasBrowseResults: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  totalInResults: number;
  positionInResults: number;
}

interface NavigationActions {
  goToPrev: () => void;
  goToNext: () => void;
  setCurrentItem: (collection: string, volume: number, item: number) => void;
}

export function useItemNavigation(
  initialCollection: string,
  initialVolume: number,
  initialItem: number,
  onNavigate: (collection: string, volume: number, item: number, direction: 'prev' | 'next') => void
): [NavigationState, NavigationActions] {
  const [browseResults, setBrowseResults] = useState<BrowseResultItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);

  // Load browse results from sessionStorage ONCE on mount
  const initialItemRef = useRef({ collection: initialCollection, volume: initialVolume, item: initialItem });

  useEffect(() => {
    const stored = sessionStorage.getItem('oshi-browse-results');
    if (stored) {
      try {
        const results: BrowseResultItem[] = JSON.parse(stored);
        setBrowseResults(results);
        const initial = initialItemRef.current;
        const idx = results.findIndex(
          r => r.collection === initial.collection && r.volume === initial.volume && r.item === initial.item
        );
        setCurrentIndex(idx);
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  const hasBrowseResults = browseResults.length > 0 && currentIndex >= 0;
  const canGoPrev = hasBrowseResults ? currentIndex > 0 : false;
  const canGoNext = hasBrowseResults ? currentIndex < browseResults.length - 1 : false;
  const totalInResults = hasBrowseResults ? browseResults.length : 0;
  const positionInResults = hasBrowseResults ? currentIndex + 1 : 0;

  const goToPrev = useCallback(() => {
    if (!canGoPrev || isNavigating) return;

    const prevItem = browseResults[currentIndex - 1];
    if (!prevItem) return;

    setIsNavigating(true);
    onNavigate(prevItem.collection, prevItem.volume, prevItem.item, 'prev');

    setTimeout(() => {
      setCurrentIndex(currentIndex - 1);
      window.history.replaceState({}, '', `/item/${prevItem.collection}/${prevItem.volume}/${prevItem.item}`);
      setIsNavigating(false);
    }, 200);
  }, [browseResults, currentIndex, isNavigating, canGoPrev, onNavigate]);

  const goToNext = useCallback(() => {
    if (!canGoNext || isNavigating) return;

    const nextItem = browseResults[currentIndex + 1];
    if (!nextItem) return;

    setIsNavigating(true);
    onNavigate(nextItem.collection, nextItem.volume, nextItem.item, 'next');

    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      window.history.replaceState({}, '', `/item/${nextItem.collection}/${nextItem.volume}/${nextItem.item}`);
      setIsNavigating(false);
    }, 200);
  }, [browseResults, currentIndex, isNavigating, canGoNext, onNavigate]);

  const setCurrentItem = useCallback((collection: string, volume: number, item: number) => {
    const idx = browseResults.findIndex(
      r => r.collection === collection && r.volume === volume && r.item === item
    );
    if (idx >= 0) {
      setCurrentIndex(idx);
    }
  }, [browseResults]);

  return [
    {
      browseResults,
      currentIndex,
      hasBrowseResults,
      canGoPrev,
      canGoNext,
      totalInResults,
      positionInResults,
    },
    {
      goToPrev,
      goToNext,
      setCurrentItem,
    },
  ];
}
