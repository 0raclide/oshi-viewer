/**
 * Search Module
 *
 * Rich query search for Japanese sword metadata.
 *
 * @example
 * import { parseQuery, matchItem, filterItems } from '@/lib/search';
 *
 * const query = parseQuery('Soshu nagasa>70 mei:kinzogan -wakizashi');
 * const results = filterItems(items, query);
 */

// Types
export type {
  ParsedQuery,
  Comparison,
  FieldMatch,
  ComparisonOperator,
  TokenType,
  FieldDefinition,
  SearchContext,
} from './types';

// Tokenizer
export { tokenize, tokenizeSimple } from './tokenizer';
export type { Token } from './tokenizer';

// Parser
export {
  parseQuery,
  isEmptyQuery,
  summarizeQuery,
  validateQuery,
} from './parser';

// Field Mappings
export {
  fieldDefinitions,
  aliasMap,
  resolveFieldName,
  getFieldDefinition,
  getFieldValue,
  getSearchableText,
  getAllFieldNames,
} from './fieldMappings';
export type { SearchableItem } from './fieldMappings';

// Matcher
export {
  matchItem,
  filterItems,
  filterItemsWithDetails,
} from './matcher';
export type { MatchResult } from './matcher';

/**
 * Convenience function: parse and filter in one step
 */
import { parseQuery as parse } from './parser';
import { filterItems as filter } from './matcher';
import type { SearchableItem } from './fieldMappings';
import type { ParsedQuery } from './types';

export function search<T extends SearchableItem>(
  items: T[],
  queryString: string
): { results: T[]; query: ParsedQuery } {
  const query = parse(queryString);
  const results = filter(items, query);
  return { results, query };
}
