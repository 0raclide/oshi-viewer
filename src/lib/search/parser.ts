/**
 * Query Parser
 *
 * Parses tokenized query strings into structured ParsedQuery objects.
 *
 * Supports:
 * - Free text: Masamune Soshu
 * - Comparisons: nagasa>70, motohaba<3.0, sori>=1.5
 * - Field matches: mei:kinzogan, nakago:ubu
 * - Negations: -wakizashi, !tanto
 * - Quoted phrases: "ko-itame hada"
 * - Shortcuts: zai (signed), mu/mumei (unsigned), ubu, ubu=1/0, session=N
 */

import { tokenize } from './tokenizer';
import { resolveFieldName, getFieldDefinition } from './fieldMappings';
import type { ParsedQuery, Comparison, FieldMatch, ComparisonOperator } from './types';

/**
 * Shortcut expansions - common terms sword researchers use
 * These are expanded before parsing to their full field:value forms
 *
 * Actual mei.status values in data: signed, mumei, kinzogan-mei, orikaeshi-mei, gaku-mei
 */
const SHORTCUTS: Record<string, string> = {
  // Mei status shortcuts - note: data uses "signed" not "zaimei"
  'zai': 'mei:signed',           // 在銘 = signed
  'zaimei': 'mei:signed',
  'signed': 'mei:signed',
  'mu': 'mei:mumei',             // 無銘 = unsigned
  'mumei': 'mei:mumei',
  'unsigned': 'mei:mumei',
  'kinzogan': 'mei:kinzogan-mei',    // 金象嵌 = gold inlay attribution
  'orikaeshi': 'mei:orikaeshi-mei',  // 折返銘 = folded signature
  'gaku': 'mei:gaku-mei',            // 額銘 = framed signature

  // Ubu shortcuts (original tang)
  'ubu': 'nakago:ubu',           // 生ぶ = original/unaltered
};

/**
 * Patterns that need special handling (not simple replacements)
 */
const SPECIAL_PATTERNS = [
  // ubu=1 → nakago:ubu, ubu=0 → -ubu (exclude ubu)
  { pattern: /^ubu=1$/i, replacement: 'nakago:ubu' },
  { pattern: /^ubu=0$/i, replacement: '-ubu' },

  // session=N or vol=N → volume:N
  { pattern: /^(?:session|vol|volume)=(\d+)$/i, replacement: 'volume:$1' },

  // juyo / tokuju as collection shortcuts
  { pattern: /^juyo$/i, replacement: 'collection:Juyo' },
  { pattern: /^tokuju$/i, replacement: 'collection:Tokuju' },
];

// Regex patterns
const COMPARISON_PATTERN = /^([a-zA-Z_]+)(>=|<=|>|<|=)(.+)$/;
const FIELD_MATCH_PATTERN = /^([a-zA-Z_]+):(.+)$/;
const NEGATION_PATTERN = /^[-!](.+)$/;
const PHRASE_PATTERN = /^"(.+)"$/;

/**
 * Expand shortcuts in a single token
 */
function expandToken(token: string): string {
  // Check special patterns first (with regex capture groups)
  for (const { pattern, replacement } of SPECIAL_PATTERNS) {
    if (pattern.test(token)) {
      return token.replace(pattern, replacement);
    }
  }

  // Check simple shortcuts (case-insensitive)
  const lower = token.toLowerCase();
  if (SHORTCUTS[lower]) {
    return SHORTCUTS[lower];
  }

  return token;
}

/**
 * Preprocess query string to expand shortcuts
 * This runs before tokenization to handle shortcuts uniformly
 */
function preprocessQuery(queryString: string): string {
  // Split by whitespace but preserve quoted strings
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < queryString.length; i++) {
    const char = queryString[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === ' ' && !inQuotes) {
      if (current) {
        parts.push(expandToken(current));
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current) {
    parts.push(expandToken(current));
  }

  return parts.join(' ');
}

/**
 * Parse a query string into a structured ParsedQuery
 */
export function parseQuery(queryString: string): ParsedQuery {
  const result: ParsedQuery = {
    textTerms: [],
    comparisons: [],
    fieldMatches: [],
    negations: [],
    phrases: [],
    original: queryString,
    errors: [],
  };

  if (!queryString || !queryString.trim()) {
    return result;
  }

  // Preprocess to expand shortcuts (zai → mei:zaimei, etc.)
  const preprocessed = preprocessQuery(queryString);
  const tokens = tokenize(preprocessed);

  for (const token of tokens) {
    const value = token.value;

    // Check for quoted phrase
    const phraseMatch = value.match(PHRASE_PATTERN);
    if (phraseMatch) {
      result.phrases.push(phraseMatch[1]);
      continue;
    }

    // Check for negation
    const negationMatch = value.match(NEGATION_PATTERN);
    if (negationMatch) {
      result.negations.push(negationMatch[1].toLowerCase());
      continue;
    }

    // Check for comparison (nagasa>70, motohaba<=3.0)
    const comparisonMatch = value.match(COMPARISON_PATTERN);
    if (comparisonMatch) {
      const [, field, operator, numValue] = comparisonMatch;
      const canonicalField = resolveFieldName(field);

      if (!canonicalField) {
        result.errors.push(`Unknown field: ${field}`);
        // Still treat the whole thing as a text term
        result.textTerms.push(value.toLowerCase());
        continue;
      }

      const fieldDef = getFieldDefinition(canonicalField);
      if (fieldDef && fieldDef.type !== 'numeric') {
        result.errors.push(`Field "${field}" is not numeric, use : for text matching`);
        // Convert to field match instead
        result.fieldMatches.push({
          field: canonicalField,
          value: `${operator}${numValue}`,
          raw: value,
        });
        continue;
      }

      const parsedValue = parseFloat(numValue);
      if (isNaN(parsedValue)) {
        result.errors.push(`Invalid number: ${numValue}`);
        result.textTerms.push(value.toLowerCase());
        continue;
      }

      result.comparisons.push({
        field: canonicalField,
        operator: operator as ComparisonOperator,
        value: parsedValue,
        raw: value,
      });
      continue;
    }

    // Check for field match (mei:kinzogan, nakago:ubu)
    const fieldMatchMatch = value.match(FIELD_MATCH_PATTERN);
    if (fieldMatchMatch) {
      const [, field, matchValue] = fieldMatchMatch;
      const canonicalField = resolveFieldName(field);

      if (!canonicalField) {
        result.errors.push(`Unknown field: ${field}`);
        // Treat as text search
        result.textTerms.push(value.toLowerCase());
        continue;
      }

      result.fieldMatches.push({
        field: canonicalField,
        value: matchValue.toLowerCase(),
        raw: value,
      });
      continue;
    }

    // Default: treat as free text term
    result.textTerms.push(value.toLowerCase());
  }

  return result;
}

/**
 * Check if a parsed query is empty (would match everything)
 */
export function isEmptyQuery(query: ParsedQuery): boolean {
  return (
    query.textTerms.length === 0 &&
    query.comparisons.length === 0 &&
    query.fieldMatches.length === 0 &&
    query.negations.length === 0 &&
    query.phrases.length === 0
  );
}

/**
 * Get a human-readable summary of the query
 */
export function summarizeQuery(query: ParsedQuery): string {
  const parts: string[] = [];

  if (query.textTerms.length > 0) {
    parts.push(`text: ${query.textTerms.join(', ')}`);
  }

  if (query.comparisons.length > 0) {
    const comps = query.comparisons.map(c => `${c.field}${c.operator}${c.value}`);
    parts.push(`comparisons: ${comps.join(', ')}`);
  }

  if (query.fieldMatches.length > 0) {
    const matches = query.fieldMatches.map(m => `${m.field}:${m.value}`);
    parts.push(`fields: ${matches.join(', ')}`);
  }

  if (query.negations.length > 0) {
    parts.push(`exclude: ${query.negations.join(', ')}`);
  }

  if (query.phrases.length > 0) {
    parts.push(`phrases: "${query.phrases.join('", "')}"`);
  }

  return parts.length > 0 ? parts.join(' | ') : '(empty query)';
}

/**
 * Validate a query and return any issues
 */
export function validateQuery(query: ParsedQuery): { valid: boolean; issues: string[] } {
  const issues: string[] = [...query.errors];

  // Check for comparisons on text fields
  for (const comp of query.comparisons) {
    const field = getFieldDefinition(comp.field);
    if (field && field.type !== 'numeric') {
      issues.push(`Cannot use comparison on text field "${comp.field}"`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
