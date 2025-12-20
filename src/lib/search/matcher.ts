/**
 * Item Matcher
 *
 * Matches items against parsed queries.
 * All conditions must be met (AND logic).
 */

import type { ParsedQuery, Comparison, FieldMatch, ComparisonOperator } from './types';
import type { SearchableItem } from './fieldMappings';
import { getFieldValue, getSearchableText } from './fieldMappings';

/**
 * Check if a numeric comparison is satisfied
 */
function checkComparison(
  itemValue: number | null | undefined,
  operator: ComparisonOperator,
  targetValue: number
): boolean {
  if (itemValue === null || itemValue === undefined) {
    return false;
  }

  switch (operator) {
    case '>':
      return itemValue > targetValue;
    case '<':
      return itemValue < targetValue;
    case '>=':
      return itemValue >= targetValue;
    case '<=':
      return itemValue <= targetValue;
    case '=':
      // For equality, allow small floating point tolerance
      return Math.abs(itemValue - targetValue) < 0.01;
    default:
      return false;
  }
}

/**
 * Check if a field value matches a target (case-insensitive, partial match for text, exact for numbers)
 */
function checkFieldMatch(
  itemValue: string | number | boolean | string[] | null | undefined,
  targetValue: string
): boolean {
  if (itemValue === null || itemValue === undefined) {
    return false;
  }

  const target = targetValue.toLowerCase();

  // Handle boolean fields
  if (typeof itemValue === 'boolean') {
    if (target === 'true' || target === 'yes' || target === '1') {
      return itemValue === true;
    }
    if (target === 'false' || target === 'no' || target === '0') {
      return itemValue === false;
    }
    return false;
  }

  // Handle numeric fields with EXACT matching
  // This ensures volume:1 matches only volume 1, not 10, 11, 12, etc.
  if (typeof itemValue === 'number') {
    const targetNum = parseFloat(target);
    if (!isNaN(targetNum)) {
      return itemValue === targetNum;
    }
    // If target is not a number, use string matching
    return String(itemValue) === target;
  }

  // Handle arrays (check if any element matches)
  if (Array.isArray(itemValue)) {
    return itemValue.some(v =>
      String(v).toLowerCase().includes(target)
    );
  }

  // Handle strings with partial/substring matching
  const stringValue = String(itemValue).toLowerCase();
  return stringValue.includes(target);
}

/**
 * Check if searchable text contains a term
 */
function textContains(searchableText: string, term: string): boolean {
  return searchableText.includes(term.toLowerCase());
}

/**
 * Check if searchable text contains an exact phrase
 */
function textContainsPhrase(searchableText: string, phrase: string): boolean {
  return searchableText.includes(phrase.toLowerCase());
}

/**
 * Match a single item against a parsed query
 *
 * @returns true if the item matches ALL conditions in the query
 */
export function matchItem(item: SearchableItem, query: ParsedQuery): boolean {
  // Cache the searchable text for this item
  const searchableText = getSearchableText(item);

  // Check negations first (if any term is found, reject)
  for (const negation of query.negations) {
    if (textContains(searchableText, negation)) {
      return false;
    }
  }

  // Check numeric comparisons (all must pass)
  for (const comparison of query.comparisons) {
    const value = getFieldValue(item, comparison.field);

    // Skip if value is not numeric
    if (typeof value !== 'number') {
      return false;
    }

    if (!checkComparison(value, comparison.operator, comparison.value)) {
      return false;
    }
  }

  // Check field matches (all must pass)
  for (const fieldMatch of query.fieldMatches) {
    const value = getFieldValue(item, fieldMatch.field);

    if (!checkFieldMatch(value, fieldMatch.value)) {
      return false;
    }
  }

  // Check phrases (all must be found)
  for (const phrase of query.phrases) {
    if (!textContainsPhrase(searchableText, phrase)) {
      return false;
    }
  }

  // Check free text terms (all must be found)
  for (const term of query.textTerms) {
    if (!textContains(searchableText, term)) {
      return false;
    }
  }

  // All conditions passed
  return true;
}

/**
 * Filter an array of items using a parsed query
 */
export function filterItems<T extends SearchableItem>(
  items: T[],
  query: ParsedQuery
): T[] {
  return items.filter(item => matchItem(item, query));
}

/**
 * Search result with match details
 */
export interface MatchResult<T> {
  item: T;
  matched: boolean;
  matchedTerms?: string[];
}

/**
 * Filter items and return detailed match information
 */
export function filterItemsWithDetails<T extends SearchableItem>(
  items: T[],
  query: ParsedQuery
): MatchResult<T>[] {
  return items.map(item => {
    const matched = matchItem(item, query);
    const matchedTerms: string[] = [];

    if (matched) {
      const searchableText = getSearchableText(item);

      // Collect which terms matched
      for (const term of query.textTerms) {
        if (textContains(searchableText, term)) {
          matchedTerms.push(term);
        }
      }
    }

    return {
      item,
      matched,
      matchedTerms: matched ? matchedTerms : undefined,
    };
  });
}
