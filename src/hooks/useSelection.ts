'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ItemReference, ItemSummary } from '@/types';
import { itemRefToId } from '@/types';

/**
 * Hook for managing multi-select state in the collection view
 * Supports single click, shift+click range, and ctrl/cmd+click toggle
 */
export function useSelection(items: ItemSummary[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  // Get ordered list of item IDs for range selection
  const itemIds = useMemo(() =>
    items.map(item => itemRefToId(item)),
    [items]
  );

  // Select a single item (replaces selection)
  const select = useCallback((ref: ItemReference) => {
    const id = itemRefToId(ref);
    setSelectedIds(new Set([id]));
    setLastSelectedId(id);
  }, []);

  // Toggle selection of an item (ctrl/cmd+click)
  const toggle = useCallback((ref: ItemReference) => {
    const id = itemRefToId(ref);
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setLastSelectedId(id);
  }, []);

  // Range select (shift+click)
  const selectRange = useCallback((ref: ItemReference) => {
    const id = itemRefToId(ref);

    if (!lastSelectedId) {
      select(ref);
      return;
    }

    const startIdx = itemIds.indexOf(lastSelectedId);
    const endIdx = itemIds.indexOf(id);

    if (startIdx === -1 || endIdx === -1) {
      select(ref);
      return;
    }

    const minIdx = Math.min(startIdx, endIdx);
    const maxIdx = Math.max(startIdx, endIdx);
    const rangeIds = itemIds.slice(minIdx, maxIdx + 1);

    setSelectedIds(prev => {
      const next = new Set(prev);
      rangeIds.forEach(id => next.add(id));
      return next;
    });
    setLastSelectedId(id);
  }, [lastSelectedId, itemIds, select]);

  // Handle click with modifiers
  const handleSelect = useCallback((ref: ItemReference, event?: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }) => {
    if (event?.shiftKey) {
      selectRange(ref);
    } else if (event?.ctrlKey || event?.metaKey) {
      toggle(ref);
    } else {
      select(ref);
    }
  }, [select, toggle, selectRange]);

  // Select all
  const selectAll = useCallback(() => {
    setSelectedIds(new Set(itemIds));
  }, [itemIds]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  // Check if an item is selected
  const isSelected = useCallback((ref: ItemReference) => {
    return selectedIds.has(itemRefToId(ref));
  }, [selectedIds]);

  // Get selected items
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.has(itemRefToId(item)));
  }, [items, selectedIds]);

  return {
    selectedIds,
    selectedItems,
    selectedCount: selectedIds.size,
    isSelected,
    select,
    toggle,
    selectRange,
    handleSelect,
    selectAll,
    clearSelection,
  };
}
