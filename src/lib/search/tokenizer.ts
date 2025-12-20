/**
 * Tokenizer for Search Queries
 *
 * Splits a query string into tokens, handling:
 * - Quoted phrases: "exact phrase"
 * - Operators: nagasa>70, mei:kinzogan
 * - Negations: -term, !term
 * - Regular terms: Masamune, Soshu
 */

export interface Token {
  value: string;
  start: number;  // Position in original string (for error highlighting)
  end: number;
}

/**
 * Tokenize a search query string into individual tokens.
 * Preserves quoted strings as single tokens.
 *
 * @example
 * tokenize('Soshu "ko-itame" nagasa>70')
 * // Returns: ["Soshu", "\"ko-itame\"", "nagasa>70"]
 */
export function tokenize(query: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;
  const length = query.length;

  while (current < length) {
    // Skip whitespace
    if (/\s/.test(query[current])) {
      current++;
      continue;
    }

    // Handle quoted strings
    if (query[current] === '"' || query[current] === "'") {
      const quote = query[current];
      const start = current;
      current++; // Skip opening quote

      let value = '';
      while (current < length && query[current] !== quote) {
        // Handle escaped quotes
        if (query[current] === '\\' && current + 1 < length) {
          current++;
          value += query[current];
        } else {
          value += query[current];
        }
        current++;
      }

      // Skip closing quote if present
      if (current < length && query[current] === quote) {
        current++;
      }

      tokens.push({
        value: `"${value}"`,  // Normalize to double quotes
        start,
        end: current,
      });
      continue;
    }

    // Handle regular tokens (including operators)
    const start = current;
    let value = '';

    while (current < length && !/\s/.test(query[current])) {
      // Don't break on quotes that are part of the token
      if ((query[current] === '"' || query[current] === "'") && value.length > 0) {
        break;
      }
      value += query[current];
      current++;
    }

    if (value) {
      tokens.push({
        value,
        start,
        end: current,
      });
    }
  }

  return tokens;
}

/**
 * Extract just the token values (for simpler use cases)
 */
export function tokenizeSimple(query: string): string[] {
  return tokenize(query).map(t => t.value);
}
