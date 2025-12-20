// Core types for Oshi Viewer

export type Collection = 'Tokuju' | 'Juyo';

export interface VolumeInfo {
  collection: Collection;
  volume: number;
  itemCount: number;
  hasTranslations: boolean;
}

export interface ItemReference {
  collection: Collection;
  volume: number;
  item: number;
}

export interface ItemSummary extends ItemReference {
  smithNameKanji?: string;
  smithNameRomaji?: string;
  school?: string;  // For fallback display when smith is unknown
  bladeType?: string;
  itemType?: string;  // 'token' | 'tosogu' | 'koshirae'
  fittingType?: string;  // For tosogu: tsuba, kozuka, etc.
  nagasa?: number;
  nakagoCondition?: string;  // ubu, suriage, o-suriage, etc.
  isEnsemble?: boolean;  // Item includes both blade and koshirae
  hasTranslation: boolean;
}

// Full metadata schema based on Oshi_data structure
export interface ItemMetadata {
  item_type: string;
  classification: 'tokubetsu-juyo' | 'juyo';
  session_number: number;
  designation_date: string | null;

  blade_type?: string;
  blade_length_category?: string;

  mei: {
    status: string;
    inscription_omote: string | null;
    inscription_ura: string | null;
    smith_name_romaji: string | null;
    smith_name_kanji: string | null;
    attribution_type: string;
    appraiser?: {
      name: string;
      kanji: string;
    };
  };

  smith?: {
    name_romaji: string | null;
    name_kanji?: string | null;
    school: string | null;
    tradition: string | null;
    lineage: string | null;
    generation: string | null;
    active_period: string | null;
  };

  // For tosogu items
  maker?: {
    name_romaji: string | null;
    name_kanji?: string | null;
    school: string | null;
    lineage: string | null;
    generation: string | null;
    branch: string | null;
    active_period: string | null;
  };

  // For koshirae items
  fittings_maker?: {
    primary_artisan: string | null;
    primary_artisan_kanji?: string | null;
    school: string | null;
    unified_set: boolean;
  };

  // Tosogu-specific fields
  fitting_type?: string;
  piece_count?: number;
  set_type?: {
    type: string;
    components?: string[];
    unified_theme?: boolean;
  };

  // Koshirae-specific fields
  mounting_type?: string;
  blade_type_intended?: string;
  style?: {
    overall: string | null;
    style_tags?: string[];
    aesthetic_notes?: string | null;
  };

  era?: {
    period: string | null;
    sub_period: string | null;
    nengo: string | null;
    western_year: number | null;
  };

  measurements: {
    nagasa: number | null;
    sori: number | null;
    motohaba: number | null;
    sakihaba: number | null;
    kissaki_nagasa: number | null;
    nakago_nagasa: number | null;
    nakago_sori: number | null;
    kasane: number | null;
  };

  sugata: {
    form: string | null;
    mune: string | null;
    kissaki: string | null;
    mihaba: string | null;
    features: string[];
  };

  condition?: {
    health: string | null;
    hiraniku: string | null;
    ha_niku: string | null;
    taihai: string | null;
    flaws: string[];
  };

  kitae: {
    primary_hada: string[];
    characteristics: string[];
  };

  hamon: {
    primary_pattern: string[];
    activities: string[];
    style: string | null;
  };

  boshi: {
    pattern: string[];
    features: string[];
  };

  horimono: {
    present: boolean;
    omote: string[];
    ura: string[];
    types: string[];
  };

  nakago: {
    condition: string | null;
    shape: string | null;
    yasurime: string[];
    mekugi_ana: number | null;
  };

  provenance: {
    denrai: string[];
    origami: {
      present: boolean;
      appraiser?: string;
    };
    sayagaki: {
      present: boolean;
      author?: string;
    };
    publications: string[];
  };

  assessment: {
    significance: string | null;
    praise_tags: string[];
    documentary_value: string | null;
    overall_summary: string | null;
  };

  article_author?: {
    name_romaji: string | null;
    name_kanji: string | null;
  };

  ensemble?: {
    is_ensemble: boolean;
    ensemble_type: string | null;
  };

  _source: {
    collection: string;
    volume: number;
    item: number;
    translation_date: string;
  };
}

export interface ItemData {
  reference: ItemReference;
  metadata: ItemMetadata | null;
  japaneseText: string | null;
  translationMarkdown: string | null;
  images: {
    oshigata: string;
    setsumei: string;
  };
}

// Search and filter types
export interface SearchFilters {
  query: string;
  collection?: Collection;
  bladeType?: string;
  school?: string;
  tradition?: string;
  period?: string;
  hasTranslation?: boolean;
}

export interface SearchResult {
  items: ItemSummary[];
  total: number;
  byBladeType: Record<string, number>;
}

// Bookmark type
export interface Bookmark {
  reference: ItemReference;
  smithName: string;
  bladeType: string;
  addedAt: string;
  collectionIds?: string[];  // Which user collections this belongs to
  notes?: string;  // Personal notes
}

// User collection (like a Spotify playlist)
export interface UserCollection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  itemIds: string[];  // Array of itemRefToId strings
}

// Special collection ID for "All Saved"
export const ALL_SAVED_COLLECTION_ID = '__all__';

// Collection View types
export type ItemType = 'token' | 'tosogu' | 'koshirae';

export interface CollectionFilters {
  query?: string;  // Text search
  collection?: Collection;
  volume?: number;
  itemType?: ItemType;  // token (blades), tosogu (fittings), koshirae (mountings)
  era?: string;
  school?: string;
  tradition?: string;
  bladeType?: string;
  smith?: string;
  meiStatus?: string;
  nakagoCondition?: string;  // ubu, suriage, o-suriage, etc.
  denrai?: string;  // Provenance (e.g., "Tokugawa shogunal house")
  kiwame?: string;  // Appraiser name (e.g., "Hon'ami Kochu", "Kojo")
  isEnsemble?: boolean;  // Items with both blade and koshirae
  hasTranslation?: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface FilterFacets {
  eras: FilterOption[];
  schools: FilterOption[];
  traditions: FilterOption[];
  bladeTypes: FilterOption[];
  smiths: FilterOption[];
  meiStatuses: FilterOption[];
  nakagoConditions: FilterOption[];
  denrais: FilterOption[];
  kiwames: FilterOption[];
}

export interface CollectionStats {
  totalItems: number;
  withTranslation: number;
  byEra: Record<string, number>;
  bySchool: Record<string, number>;
  byTradition: Record<string, number>;
  byBladeType: Record<string, number>;
  byMeiStatus: Record<string, number>;
  avgNagasa: number | null;
  nagasaRange: { min: number; max: number } | null;
}

export interface SelectionState {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
}

// Utility to create item ID from reference
export function itemRefToId(ref: ItemReference): string {
  return `${ref.collection}-${ref.volume}-${ref.item}`;
}

export function idToItemRef(id: string): ItemReference {
  const [collection, volume, item] = id.split('-');
  return {
    collection: collection as Collection,
    volume: parseInt(volume, 10),
    item: parseInt(item, 10),
  };
}
