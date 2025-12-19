// Japanese Sword Terminology Glossary
// Loads comprehensive glossary from Oshi_data

import glossaryData from '../data/glossary.json';

export type GlossaryCategory =
  | 'blade_types'
  | 'sugata'
  | 'kitae'
  | 'hamon'
  | 'boshi'
  | 'nakago'
  | 'horimono'
  | 'koshirae'
  | 'tosogu'
  | 'metalwork'
  | 'lacquer'
  | 'assessment'
  | 'documentation'
  | 'schools'
  | 'general';

export interface GlossaryEntry {
  term: string;
  reading?: string;
  kanji?: string;
  definition: string;
  category?: GlossaryCategory;
}

// Build lookup dictionary from JSON data
const glossary: Record<string, GlossaryEntry> = {};

for (const item of glossaryData.terms) {
  const key = item.romaji.toLowerCase();
  glossary[key] = {
    term: item.romaji.charAt(0).toUpperCase() + item.romaji.slice(1),
    kanji: item.kanji,
    definition: item.definition,
    category: item.category as GlossaryCategory,
  };

  // Also add without hyphens for easier matching
  const keyNoHyphen = key.replace(/-/g, '');
  if (keyNoHyphen !== key) {
    glossary[keyNoHyphen] = glossary[key];
  }

  // Add with spaces instead of hyphens
  const keyWithSpaces = key.replace(/-/g, ' ');
  if (keyWithSpaces !== key) {
    glossary[keyWithSpaces] = glossary[key];
  }
}

// Function to find a term in the glossary (case-insensitive)
export function findTerm(term: string): GlossaryEntry | undefined {
  // Normalize the term
  const normalized = term
    .toLowerCase()
    .trim()
    .replace(/[ōōûū]/g, (c) => {
      const map: Record<string, string> = { 'ō': 'o', 'ū': 'u', 'û': 'u' };
      return map[c] || c;
    });

  // Try direct match
  if (glossary[normalized]) {
    return glossary[normalized];
  }

  // Try without hyphens
  const noHyphen = normalized.replace(/-/g, '');
  if (glossary[noHyphen]) {
    return glossary[noHyphen];
  }

  // Try with hyphens replaced by spaces
  const withSpaces = normalized.replace(/-/g, ' ');
  if (glossary[withSpaces]) {
    return glossary[withSpaces];
  }

  return undefined;
}

// Get all terms for a category
export function getTermsByCategory(category: GlossaryCategory): GlossaryEntry[] {
  return Object.values(glossary).filter(entry => entry.category === category);
}

// Get all glossary entries
export function getAllTerms(): GlossaryEntry[] {
  // Use Set to avoid duplicates from the alias entries
  const seen = new Set<string>();
  return Object.values(glossary).filter(entry => {
    const key = entry.term.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Get total term count
export function getTermCount(): number {
  return glossaryData._metadata.total_terms;
}
