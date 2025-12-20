// Data access utilities for Oshi_data repository
import fs from 'fs';
import path from 'path';
import type { Collection, ItemReference, ItemMetadata, ItemSummary, VolumeInfo, SearchFilters, SearchResult } from '@/types';
import { parseQuery, matchItem, isEmptyQuery } from '@/lib/search';

const DATA_ROOT = process.env.OSHI_DATA_PATH || '/Users/christopherhill/Desktop/Claude_project/Oshi_data';

// Path helpers
export function getProcessedPath(collection: Collection, volume: number): string {
  return path.join(DATA_ROOT, 'data', 'processed', collection, `vol_${String(volume).padStart(3, '0')}`);
}

export function getTranslationsPath(collection: Collection, volume: number): string {
  return path.join(DATA_ROOT, 'data', 'translations', collection, `vol_${String(volume).padStart(3, '0')}`);
}

export function getOshigataPath(ref: ItemReference): string {
  return path.join(
    getProcessedPath(ref.collection, ref.volume),
    `item_${String(ref.item).padStart(3, '0')}_oshigata.jpg`
  );
}

export function getSetsumeiPath(ref: ItemReference): string {
  return path.join(
    getProcessedPath(ref.collection, ref.volume),
    `item_${String(ref.item).padStart(3, '0')}_setsumei.jpg`
  );
}

export function getMetadataPath(ref: ItemReference): string {
  return path.join(
    getTranslationsPath(ref.collection, ref.volume),
    `item_${String(ref.item).padStart(3, '0')}_metadata.json`
  );
}

export function getJapanesePath(ref: ItemReference): string {
  return path.join(
    getTranslationsPath(ref.collection, ref.volume),
    `item_${String(ref.item).padStart(3, '0')}_japanese.txt`
  );
}

export function getTranslationPath(ref: ItemReference): string {
  return path.join(
    getTranslationsPath(ref.collection, ref.volume),
    `item_${String(ref.item).padStart(3, '0')}_translation.md`
  );
}

// Check if file exists
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

// Read JSON file
export function readJsonFile<T>(filePath: string): T | null {
  try {
    if (!fileExists(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    return null;
  }
}

// Read text file
export function readTextFile(filePath: string): string | null {
  try {
    if (!fileExists(filePath)) return null;
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading text file ${filePath}:`, error);
    return null;
  }
}

// Helper to extract maker name based on item type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractMakerName(metadata: any): { romaji?: string; kanji?: string } {
  if (!metadata) return {};

  const itemType = metadata.item_type;

  // For blades (token), use smith
  if (itemType === 'token' || !itemType) {
    return {
      romaji: metadata.mei?.smith_name_romaji || metadata.smith?.name_romaji || undefined,
      kanji: metadata.mei?.smith_name_kanji || metadata.smith?.name_kanji || undefined,
    };
  }

  // For tosogu, use maker
  if (itemType === 'tosogu') {
    return {
      romaji: metadata.maker?.name_romaji || metadata.mei?.smith_name_romaji || undefined,
      kanji: metadata.maker?.name_kanji || metadata.mei?.smith_name_kanji || undefined,
    };
  }

  // For koshirae, use fittings_maker
  if (itemType === 'koshirae') {
    return {
      romaji: metadata.fittings_maker?.primary_artisan || undefined,
      kanji: metadata.fittings_maker?.primary_artisan_kanji || undefined,
    };
  }

  // Fallback
  return {
    romaji: metadata.mei?.smith_name_romaji || metadata.smith?.name_romaji || undefined,
    kanji: metadata.mei?.smith_name_kanji || metadata.smith?.name_kanji || undefined,
  };
}

// Helper to get display type (blade_type for token, fitting_type for tosogu, mounting_type for koshirae)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractDisplayType(metadata: any): string | undefined {
  if (!metadata) return undefined;

  const itemType = metadata.item_type;

  if (itemType === 'tosogu') {
    return metadata.fitting_type || undefined;
  }

  if (itemType === 'koshirae') {
    return metadata.mounting_type || 'koshirae';
  }

  // Default: blade_type for token
  return metadata.blade_type || undefined;
}

// Get volume manifest
export function getVolumeManifest(): Record<string, unknown> | null {
  const manifestPath = path.join(DATA_ROOT, 'config', 'volume_manifest.json');
  return readJsonFile(manifestPath);
}

// List all volumes for a collection
export function listVolumes(collection: Collection): VolumeInfo[] {
  const processedPath = path.join(DATA_ROOT, 'data', 'processed', collection);
  const translationsPath = path.join(DATA_ROOT, 'data', 'translations', collection);

  const volumes: VolumeInfo[] = [];

  try {
    const dirs = fs.readdirSync(processedPath);
    for (const dir of dirs) {
      const match = dir.match(/^vol_(\d+)$/);
      if (match) {
        const volume = parseInt(match[1], 10);
        const volPath = path.join(processedPath, dir);
        const transPath = path.join(translationsPath, dir);

        // Count items in this volume
        const files = fs.readdirSync(volPath);
        const oshigataFiles = files.filter(f => f.endsWith('_oshigata.jpg'));

        volumes.push({
          collection,
          volume,
          itemCount: oshigataFiles.length,
          hasTranslations: fileExists(transPath),
        });
      }
    }
  } catch (error) {
    console.error(`Error listing volumes for ${collection}:`, error);
  }

  return volumes.sort((a, b) => a.volume - b.volume);
}

// List items in a volume
export function listItems(collection: Collection, volume: number): ItemSummary[] {
  const processedPath = getProcessedPath(collection, volume);
  const translationsPath = getTranslationsPath(collection, volume);
  const items: ItemSummary[] = [];

  try {
    const files = fs.readdirSync(processedPath);
    const oshigataFiles = files.filter(f => f.endsWith('_oshigata.jpg'));

    for (const file of oshigataFiles) {
      const match = file.match(/^item_(\d+)_oshigata\.jpg$/);
      if (match) {
        const itemNum = parseInt(match[1], 10);
        const ref: ItemReference = { collection, volume, item: itemNum };

        // Try to load metadata for summary info
        const metadataPath = getMetadataPath(ref);
        const metadata = readJsonFile<ItemMetadata>(metadataPath);

        // Use helper functions to extract maker name and type based on item_type
        const makerName = extractMakerName(metadata);
        const displayType = extractDisplayType(metadata);

        // Extract school based on item type
        const school = metadata?.smith?.school || metadata?.maker?.school || metadata?.fittings_maker?.school || undefined;

        items.push({
          ...ref,
          smithNameKanji: makerName.kanji,
          smithNameRomaji: makerName.romaji,
          school,
          bladeType: displayType,
          itemType: metadata?.item_type || undefined,
          fittingType: metadata?.fitting_type || undefined,
          nagasa: metadata?.measurements?.nagasa || undefined,
          hasTranslation: fileExists(path.join(translationsPath, `item_${String(itemNum).padStart(3, '0')}_translation.md`)),
        });
      }
    }
  } catch (error) {
    console.error(`Error listing items for ${collection} vol ${volume}:`, error);
  }

  return items.sort((a, b) => a.item - b.item);
}

// Get full item data
export function getItemData(ref: ItemReference): {
  metadata: ItemMetadata | null;
  japaneseText: string | null;
  translationMarkdown: string | null;
} {
  return {
    metadata: readJsonFile<ItemMetadata>(getMetadataPath(ref)),
    japaneseText: readTextFile(getJapanesePath(ref)),
    translationMarkdown: readTextFile(getTranslationPath(ref)),
  };
}

// Search items across collections
export function searchItems(filters: SearchFilters): SearchResult {
  const results: ItemSummary[] = [];
  const byBladeType: Record<string, number> = {};

  const collections: Collection[] = filters.collection ? [filters.collection] : ['Tokuju', 'Juyo'];
  const query = filters.query?.toLowerCase() || '';

  for (const collection of collections) {
    const volumes = listVolumes(collection);

    for (const vol of volumes) {
      // Skip volumes without translations if filter requires them
      if (filters.hasTranslation && !vol.hasTranslations) continue;

      const items = listItems(collection, vol.volume);

      for (const item of items) {
        // Apply filters
        if (filters.hasTranslation && !item.hasTranslation) continue;

        // Search query matching
        if (query) {
          const searchableText = [
            item.smithNameKanji,
            item.smithNameRomaji,
            item.bladeType,
          ].filter(Boolean).join(' ').toLowerCase();

          if (!searchableText.includes(query)) continue;
        }

        // Blade type filter
        if (filters.bladeType && item.bladeType !== filters.bladeType) continue;

        results.push(item);

        // Count by blade type
        const bt = item.bladeType || 'unknown';
        byBladeType[bt] = (byBladeType[bt] || 0) + 1;
      }
    }
  }

  return {
    items: results,
    total: results.length,
    byBladeType,
  };
}

// Get collection stats
export function getCollectionStats(collection: Collection): {
  totalVolumes: number;
  totalItems: number;
  volumesWithTranslations: number;
} {
  const volumes = listVolumes(collection);
  return {
    totalVolumes: volumes.length,
    totalItems: volumes.reduce((sum, v) => sum + v.itemCount, 0),
    volumesWithTranslations: volumes.filter(v => v.hasTranslations).length,
  };
}

// Extended item info for browse view (includes era, tradition, meiStatus, nakagoCondition, denrai, kiwame)
export interface BrowseItem extends ItemSummary {
  era?: string;
  tradition?: string;
  meiStatus?: string;
  isEnsemble?: boolean;
  denrai?: string;  // Primary provenance (first entry from denrai array)
  kiwame?: string;  // Appraiser name (e.g., "Hon'ami Kochu", "Kojo")
}

// Internal item with all fields for filtering (includes metadata for rich search)
interface InternalBrowseItem extends BrowseItem {
  smithRomaji?: string;
  metadata?: ItemMetadata | null;  // For rich search matching
}

// Get all items for browse view with extended metadata
// Facet counts are computed dynamically based on filtered results
export function getBrowseItems(filters?: {
  query?: string;  // Text search
  collection?: Collection;
  volume?: number;
  itemType?: string;  // token, tosogu, koshirae
  era?: string;
  school?: string;
  tradition?: string;
  bladeType?: string;
  smith?: string;
  meiStatus?: string;
  nakagoCondition?: string;
  denrai?: string;  // Provenance filter
  kiwame?: string;  // Appraiser filter
  isEnsemble?: boolean;  // Filter for items with blade + koshirae
  hasTranslation?: boolean;
}): {
  items: BrowseItem[];
  facets: {
    eras: { value: string; label: string; count: number }[];
    schools: { value: string; label: string; count: number }[];
    traditions: { value: string; label: string; count: number }[];
    bladeTypes: { value: string; label: string; count: number }[];
    smiths: { value: string; label: string; count: number }[];
    meiStatuses: { value: string; label: string; count: number }[];
    nakagoConditions: { value: string; label: string; count: number }[];
    denrais: { value: string; label: string; count: number }[];
    kiwames: { value: string; label: string; count: number }[];
  };
} {
  // First pass: collect all items with metadata
  const rawItems: InternalBrowseItem[] = [];

  const collections: Collection[] = filters?.collection ? [filters.collection] : ['Tokuju', 'Juyo'];

  for (const collection of collections) {
    const volumes = listVolumes(collection);

    for (const vol of volumes) {
      // Skip if filtering by specific volume
      if (filters?.volume !== undefined && vol.volume !== filters.volume) continue;

      const processedPath = getProcessedPath(collection, vol.volume);
      const translationsPath = getTranslationsPath(collection, vol.volume);

      try {
        const files = fs.readdirSync(processedPath);
        const oshigataFiles = files.filter(f => f.endsWith('_oshigata.jpg'));

        for (const file of oshigataFiles) {
          const match = file.match(/^item_(\d+)_oshigata\.jpg$/);
          if (!match) continue;

          const itemNum = parseInt(match[1], 10);
          const ref: ItemReference = { collection, volume: vol.volume, item: itemNum };

          // Load full metadata
          const metadataPath = getMetadataPath(ref);
          const metadata = readJsonFile<ItemMetadata>(metadataPath);

          const makerName = extractMakerName(metadata);
          const displayType = extractDisplayType(metadata);
          const school = metadata?.smith?.school || metadata?.maker?.school || metadata?.fittings_maker?.school || undefined;
          const era = metadata?.era?.period || undefined;
          const tradition = metadata?.smith?.tradition || metadata?.maker?.lineage || undefined;
          const meiStatus = metadata?.mei?.status || undefined;
          const nakagoCondition = metadata?.nakago?.condition || undefined;
          const isEnsemble = metadata?.ensemble?.is_ensemble || false;
          const hasTranslation = fileExists(path.join(translationsPath, `item_${String(itemNum).padStart(3, '0')}_translation.md`));
          // Extract primary denrai (provenance) - first non-empty entry
          const denraiArray = metadata?.provenance?.denrai || [];
          const denrai = denraiArray.find((d: string) => d && d.trim()) || undefined;
          // Extract kiwame (appraiser name)
          const kiwame = metadata?.mei?.appraiser?.name || undefined;

          rawItems.push({
            collection,
            volume: vol.volume,
            item: itemNum,
            smithNameKanji: makerName.kanji,
            smithNameRomaji: makerName.romaji,
            smithRomaji: makerName.romaji, // For filtering
            school,
            bladeType: displayType,
            itemType: metadata?.item_type || undefined,
            fittingType: metadata?.fitting_type || undefined,
            nagasa: metadata?.measurements?.nagasa || undefined,
            nakagoCondition,
            isEnsemble,
            hasTranslation,
            era,
            tradition,
            meiStatus,
            denrai,
            kiwame,
            metadata,  // Store full metadata for rich search
          });
        }
      } catch (error) {
        console.error(`Error processing ${collection} vol ${vol.volume}:`, error);
      }
    }
  }

  // Parse the search query once (if provided)
  const parsedQuery = filters?.query ? parseQuery(filters.query) : null;
  const hasSearchQuery = parsedQuery && !isEmptyQuery(parsedQuery);

  // Helper to check if item matches a filter (excluding one filter for facet counting)
  const matchesFilters = (item: InternalBrowseItem, excludeFilter?: string): boolean => {
    if (excludeFilter !== 'itemType' && filters?.itemType && item.itemType !== filters.itemType) return false;
    if (excludeFilter !== 'era' && filters?.era && item.era !== filters.era) return false;
    if (excludeFilter !== 'school' && filters?.school && item.school !== filters.school) return false;
    if (excludeFilter !== 'tradition' && filters?.tradition && item.tradition !== filters.tradition) return false;
    if (excludeFilter !== 'bladeType' && filters?.bladeType && item.bladeType !== filters.bladeType) return false;
    if (excludeFilter !== 'smith' && filters?.smith && item.smithRomaji !== filters.smith) return false;
    if (excludeFilter !== 'meiStatus' && filters?.meiStatus && item.meiStatus !== filters.meiStatus) return false;
    if (excludeFilter !== 'nakagoCondition' && filters?.nakagoCondition && item.nakagoCondition !== filters.nakagoCondition) return false;
    if (excludeFilter !== 'denrai' && filters?.denrai && item.denrai !== filters.denrai) return false;
    if (excludeFilter !== 'kiwame' && filters?.kiwame && item.kiwame !== filters.kiwame) return false;
    if (excludeFilter !== 'isEnsemble' && filters?.isEnsemble === true && !item.isEnsemble) return false;
    if (excludeFilter !== 'hasTranslation' && filters?.hasTranslation === true && !item.hasTranslation) return false;
    if (excludeFilter !== 'hasTranslation' && filters?.hasTranslation === false && item.hasTranslation) return false;

    // Rich search query matching (supports field:value, comparisons, negations, phrases)
    if (hasSearchQuery && parsedQuery) {
      if (!matchItem(item, parsedQuery)) return false;
    }

    return true;
  };

  // Compute facet counts dynamically (each facet counts items matching all OTHER filters)
  const computeFacetCounts = (field: keyof InternalBrowseItem, filterName: string): Record<string, number> => {
    const counts: Record<string, number> = {};
    for (const item of rawItems) {
      if (!matchesFilters(item, filterName)) continue;
      const value = item[field] as string | undefined;
      if (value && value !== 'Unknown') {
        counts[value] = (counts[value] || 0) + 1;
      }
    }
    return counts;
  };

  const eraCounts = computeFacetCounts('era', 'era');
  const schoolCounts = computeFacetCounts('school', 'school');
  const traditionCounts = computeFacetCounts('tradition', 'tradition');
  const bladeTypeCounts = computeFacetCounts('bladeType', 'bladeType');
  const smithCounts = computeFacetCounts('smithRomaji', 'smith');
  const meiStatusCounts = computeFacetCounts('meiStatus', 'meiStatus');
  const nakagoConditionCounts = computeFacetCounts('nakagoCondition', 'nakagoCondition');
  const denraiCounts = computeFacetCounts('denrai', 'denrai');
  const kiwameCounts = computeFacetCounts('kiwame', 'kiwame');

  // Filter items for final result
  const filteredItems = rawItems.filter(item => matchesFilters(item));

  // Sort items by collection, volume, item number
  filteredItems.sort((a, b) => {
    if (a.collection !== b.collection) return a.collection.localeCompare(b.collection);
    if (a.volume !== b.volume) return a.volume - b.volume;
    return a.item - b.item;
  });

  // Convert counts to facet options
  const toFacetOptions = (counts: Record<string, number>) =>
    Object.entries(counts)
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);

  return {
    items: filteredItems,
    facets: {
      eras: toFacetOptions(eraCounts),
      schools: toFacetOptions(schoolCounts),
      traditions: toFacetOptions(traditionCounts),
      bladeTypes: toFacetOptions(bladeTypeCounts),
      smiths: toFacetOptions(smithCounts).slice(0, 50), // Limit smiths to top 50
      meiStatuses: toFacetOptions(meiStatusCounts),
      nakagoConditions: toFacetOptions(nakagoConditionCounts),
      denrais: toFacetOptions(denraiCounts).slice(0, 50), // Limit denrai to top 50
      kiwames: toFacetOptions(kiwameCounts),
    },
  };
}
