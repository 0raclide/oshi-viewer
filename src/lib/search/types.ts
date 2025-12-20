/**
 * Search Query Types
 *
 * Represents the parsed structure of a search query.
 * Example query: "Soshu Masamune nagasa>70 mei:kinzogan -wakizashi"
 */

/** Comparison operators for numeric fields */
export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '=';

/** A numeric comparison like nagasa>70 */
export interface Comparison {
  field: string;      // Normalized field name (e.g., 'nagasa', not 'cm')
  operator: ComparisonOperator;
  value: number;
  raw: string;        // Original token for error messages
}

/** A field:value match like mei:kinzogan */
export interface FieldMatch {
  field: string;      // Normalized field name
  value: string;      // Value to match (case-insensitive)
  raw: string;        // Original token for error messages
}

/** Fully parsed query structure */
export interface ParsedQuery {
  /** Free text terms to match against any searchable field */
  textTerms: string[];

  /** Numeric comparisons (nagasa>70, motohaba<3.0) */
  comparisons: Comparison[];

  /** Exact field matches (mei:kinzogan, nakago:ubu) */
  fieldMatches: FieldMatch[];

  /** Terms to exclude (prefixed with - or !) */
  negations: string[];

  /** Quoted exact phrases ("ko-itame hada") */
  phrases: string[];

  /** Original query string */
  original: string;

  /** Any parsing errors or warnings */
  errors: string[];
}

/** Result of parsing a single token */
export type TokenType =
  | { type: 'text'; value: string }
  | { type: 'phrase'; value: string }
  | { type: 'negation'; value: string }
  | { type: 'comparison'; field: string; operator: ComparisonOperator; value: number; raw: string }
  | { type: 'fieldMatch'; field: string; value: string; raw: string }
  | { type: 'error'; message: string; raw: string };

/** Field definition for mapping aliases and extracting values */
export interface FieldDefinition {
  /** Canonical field name */
  name: string;

  /** Alternative names users might type */
  aliases: string[];

  /** Field type determines how matching is done */
  type: 'numeric' | 'text' | 'array' | 'boolean';

  /** Human-readable description for help */
  description: string;

  /** Example values for auto-complete */
  examples?: string[];
}

/** Search context - additional data that might be useful during matching */
export interface SearchContext {
  /** Total items being searched (for stats) */
  totalItems?: number;
}
