'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserCollection, ItemReference, Bookmark } from '@/types';
import { itemRefToId, ALL_SAVED_COLLECTION_ID } from '@/types';

const COLLECTIONS_STORAGE_KEY = 'oshi-viewer-collections';
const BOOKMARKS_STORAGE_KEY = 'oshi-viewer-bookmarks';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function useCollections() {
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCollections = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
      if (storedCollections) {
        setCollections(JSON.parse(storedCollections));
      }

      const storedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save collections to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
      } catch (error) {
        console.error('Error saving collections:', error);
      }
    }
  }, [collections, isLoaded]);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error('Error saving bookmarks:', error);
      }
    }
  }, [bookmarks, isLoaded]);

  // Create a new collection
  const createCollection = useCallback((name: string, description?: string): UserCollection => {
    const newCollection: UserCollection = {
      id: generateId(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemIds: [],
    };
    setCollections(prev => [...prev, newCollection]);
    return newCollection;
  }, []);

  // Delete a collection
  const deleteCollection = useCallback((collectionId: string) => {
    setCollections(prev => prev.filter(c => c.id !== collectionId));
    // Also remove this collection from bookmarks' collectionIds
    setBookmarks(prev => prev.map(b => ({
      ...b,
      collectionIds: b.collectionIds?.filter(id => id !== collectionId),
    })));
  }, []);

  // Rename a collection
  const renameCollection = useCallback((collectionId: string, newName: string) => {
    setCollections(prev => prev.map(c =>
      c.id === collectionId
        ? { ...c, name: newName, updatedAt: new Date().toISOString() }
        : c
    ));
  }, []);

  // Add item to bookmark (All Saved) and optionally to specific collections
  const saveItem = useCallback((
    reference: ItemReference,
    smithName: string,
    bladeType: string,
    collectionIds: string[] = []
  ) => {
    const itemId = itemRefToId(reference);

    // Add/update bookmark
    setBookmarks(prev => {
      const existing = prev.find(
        b => b.reference.collection === reference.collection &&
          b.reference.volume === reference.volume &&
          b.reference.item === reference.item
      );

      if (existing) {
        // Update existing bookmark's collections
        return prev.map(b =>
          b.reference.collection === reference.collection &&
          b.reference.volume === reference.volume &&
          b.reference.item === reference.item
            ? { ...b, collectionIds: [...new Set([...(b.collectionIds || []), ...collectionIds])] }
            : b
        );
      }

      // Add new bookmark
      return [...prev, {
        reference,
        smithName,
        bladeType,
        addedAt: new Date().toISOString(),
        collectionIds,
      }];
    });

    // Add to specified collections
    if (collectionIds.length > 0) {
      setCollections(prev => prev.map(c =>
        collectionIds.includes(c.id) && !c.itemIds.includes(itemId)
          ? { ...c, itemIds: [...c.itemIds, itemId], updatedAt: new Date().toISOString() }
          : c
      ));
    }
  }, []);

  // Remove item from All Saved (completely unsave)
  const unsaveItem = useCallback((reference: ItemReference) => {
    const itemId = itemRefToId(reference);

    // Remove from bookmarks
    setBookmarks(prev => prev.filter(
      b => !(b.reference.collection === reference.collection &&
        b.reference.volume === reference.volume &&
        b.reference.item === reference.item)
    ));

    // Remove from all collections
    setCollections(prev => prev.map(c => ({
      ...c,
      itemIds: c.itemIds.filter(id => id !== itemId),
      updatedAt: new Date().toISOString(),
    })));
  }, []);

  // Add item to a specific collection
  const addToCollection = useCallback((reference: ItemReference, collectionId: string, smithName?: string, bladeType?: string) => {
    const itemId = itemRefToId(reference);

    // Ensure item is bookmarked first
    setBookmarks(prev => {
      const existing = prev.find(
        b => b.reference.collection === reference.collection &&
          b.reference.volume === reference.volume &&
          b.reference.item === reference.item
      );

      if (existing) {
        // Add collection to existing bookmark
        return prev.map(b =>
          b.reference.collection === reference.collection &&
          b.reference.volume === reference.volume &&
          b.reference.item === reference.item
            ? { ...b, collectionIds: [...new Set([...(b.collectionIds || []), collectionId])] }
            : b
        );
      }

      // Create new bookmark with this collection
      return [...prev, {
        reference,
        smithName: smithName || 'Unknown',
        bladeType: bladeType || '',
        addedAt: new Date().toISOString(),
        collectionIds: [collectionId],
      }];
    });

    // Add to the collection
    setCollections(prev => prev.map(c =>
      c.id === collectionId && !c.itemIds.includes(itemId)
        ? { ...c, itemIds: [...c.itemIds, itemId], updatedAt: new Date().toISOString() }
        : c
    ));
  }, []);

  // Remove item from a specific collection (but keep in All Saved)
  const removeFromCollection = useCallback((reference: ItemReference, collectionId: string) => {
    const itemId = itemRefToId(reference);

    // Remove collection from bookmark's collectionIds
    setBookmarks(prev => prev.map(b =>
      b.reference.collection === reference.collection &&
      b.reference.volume === reference.volume &&
      b.reference.item === reference.item
        ? { ...b, collectionIds: b.collectionIds?.filter(id => id !== collectionId) }
        : b
    ));

    // Remove from collection
    setCollections(prev => prev.map(c =>
      c.id === collectionId
        ? { ...c, itemIds: c.itemIds.filter(id => id !== itemId), updatedAt: new Date().toISOString() }
        : c
    ));
  }, []);

  // Check if item is saved (in All Saved)
  const isSaved = useCallback((reference: ItemReference): boolean => {
    return bookmarks.some(
      b => b.reference.collection === reference.collection &&
        b.reference.volume === reference.volume &&
        b.reference.item === reference.item
    );
  }, [bookmarks]);

  // Check if item is in a specific collection
  const isInCollection = useCallback((reference: ItemReference, collectionId: string): boolean => {
    if (collectionId === ALL_SAVED_COLLECTION_ID) {
      return isSaved(reference);
    }
    const itemId = itemRefToId(reference);
    const collection = collections.find(c => c.id === collectionId);
    return collection?.itemIds.includes(itemId) ?? false;
  }, [collections, isSaved]);

  // Get collections that contain an item
  const getItemCollections = useCallback((reference: ItemReference): string[] => {
    const itemId = itemRefToId(reference);
    return collections
      .filter(c => c.itemIds.includes(itemId))
      .map(c => c.id);
  }, [collections]);

  // Get bookmark for an item (includes notes, addedAt, etc)
  const getBookmark = useCallback((reference: ItemReference): Bookmark | undefined => {
    return bookmarks.find(
      b => b.reference.collection === reference.collection &&
        b.reference.volume === reference.volume &&
        b.reference.item === reference.item
    );
  }, [bookmarks]);

  // Update notes for a bookmarked item
  const updateNotes = useCallback((reference: ItemReference, notes: string) => {
    setBookmarks(prev => prev.map(b =>
      b.reference.collection === reference.collection &&
      b.reference.volume === reference.volume &&
      b.reference.item === reference.item
        ? { ...b, notes }
        : b
    ));
  }, []);

  // Get all items in a collection (or all saved)
  const getCollectionItems = useCallback((collectionId: string): Bookmark[] => {
    if (collectionId === ALL_SAVED_COLLECTION_ID) {
      return bookmarks;
    }
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return [];

    return collection.itemIds
      .map(itemId => bookmarks.find(b => itemRefToId(b.reference) === itemId))
      .filter((b): b is Bookmark => b !== undefined);
  }, [collections, bookmarks]);

  // Toggle save (quick save/unsave)
  const toggleSave = useCallback((
    reference: ItemReference,
    smithName: string,
    bladeType: string
  ) => {
    if (isSaved(reference)) {
      unsaveItem(reference);
    } else {
      saveItem(reference, smithName, bladeType);
    }
  }, [isSaved, unsaveItem, saveItem]);

  return {
    // Collections
    collections,
    createCollection,
    deleteCollection,
    renameCollection,

    // Items/Bookmarks
    bookmarks,
    saveItem,
    unsaveItem,
    addToCollection,
    removeFromCollection,
    isSaved,
    isInCollection,
    getItemCollections,
    getBookmark,
    updateNotes,
    getCollectionItems,
    toggleSave,

    isLoaded,
  };
}
