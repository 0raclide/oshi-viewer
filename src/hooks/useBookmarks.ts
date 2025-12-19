'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ItemReference, Bookmark } from '@/types';

const STORAGE_KEY = 'oshi-viewer-bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error('Error saving bookmarks:', error);
      }
    }
  }, [bookmarks, isLoaded]);

  const addBookmark = useCallback((
    reference: ItemReference,
    smithName: string,
    bladeType: string
  ) => {
    setBookmarks(prev => {
      // Check if already bookmarked
      const exists = prev.some(
        b => b.reference.collection === reference.collection &&
          b.reference.volume === reference.volume &&
          b.reference.item === reference.item
      );
      if (exists) return prev;

      return [...prev, {
        reference,
        smithName,
        bladeType,
        addedAt: new Date().toISOString(),
      }];
    });
  }, []);

  const removeBookmark = useCallback((reference: ItemReference) => {
    setBookmarks(prev => prev.filter(
      b => !(b.reference.collection === reference.collection &&
        b.reference.volume === reference.volume &&
        b.reference.item === reference.item)
    ));
  }, []);

  const isBookmarked = useCallback((reference: ItemReference) => {
    return bookmarks.some(
      b => b.reference.collection === reference.collection &&
        b.reference.volume === reference.volume &&
        b.reference.item === reference.item
    );
  }, [bookmarks]);

  const toggleBookmark = useCallback((
    reference: ItemReference,
    smithName: string,
    bladeType: string
  ) => {
    if (isBookmarked(reference)) {
      removeBookmark(reference);
    } else {
      addBookmark(reference, smithName, bladeType);
    }
  }, [isBookmarked, addBookmark, removeBookmark]);

  return {
    bookmarks,
    isLoaded,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
  };
}
