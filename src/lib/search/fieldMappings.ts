/**
 * Field Mappings for Search
 *
 * Maps user-friendly field names/aliases to actual metadata paths,
 * and provides value extraction functions.
 */

import type { ItemMetadata } from '@/types';
import type { FieldDefinition } from './types';

// Type for items that have been enriched with metadata for searching
export interface SearchableItem {
  // Basic item info (always present)
  collection: string;
  volume: number;
  item: number;
  smithNameKanji?: string;
  smithNameRomaji?: string;
  school?: string;
  bladeType?: string;
  itemType?: string;
  fittingType?: string;
  nagasa?: number;
  nakagoCondition?: string;
  hasTranslation: boolean;
  era?: string;
  tradition?: string;
  meiStatus?: string;

  // Full metadata (when available)
  metadata?: ItemMetadata | null;
}

/**
 * Field definitions with aliases and types
 */
export const fieldDefinitions: FieldDefinition[] = [
  // Numeric fields - measurements
  {
    name: 'nagasa',
    aliases: ['cm', 'length', 'blade_length'],
    type: 'numeric',
    description: 'Blade length in cm',
    examples: ['nagasa>70', 'cm<60'],
  },
  {
    name: 'sori',
    aliases: ['curve', 'curvature'],
    type: 'numeric',
    description: 'Blade curvature in cm',
    examples: ['sori>1.5'],
  },
  {
    name: 'motohaba',
    aliases: ['width', 'base_width'],
    type: 'numeric',
    description: 'Width at base (motohaba) in cm',
    examples: ['motohaba>3.0'],
  },
  {
    name: 'sakihaba',
    aliases: ['tip_width'],
    type: 'numeric',
    description: 'Width at tip in cm',
    examples: ['sakihaba<2.5'],
  },
  {
    name: 'kasane',
    aliases: ['thickness'],
    type: 'numeric',
    description: 'Blade thickness in cm',
    examples: ['kasane>0.7'],
  },
  {
    name: 'kissaki',
    aliases: ['kissaki_nagasa', 'point_length'],
    type: 'numeric',
    description: 'Kissaki (point) length in cm',
  },
  {
    name: 'nakago_length',
    aliases: ['nakago_nagasa', 'tang_length'],
    type: 'numeric',
    description: 'Tang length in cm',
  },
  {
    name: 'mekugi',
    aliases: ['mekugi_ana', 'holes', 'peg_holes'],
    type: 'numeric',
    description: 'Number of mekugi-ana (peg holes)',
    examples: ['mekugi=2'],
  },

  // Text fields
  {
    name: 'school',
    aliases: ['ha', 'smithing_school'],
    type: 'text',
    description: 'Sword-making school',
    examples: ['school:Rai', 'school:Ichimonji'],
  },
  {
    name: 'tradition',
    aliases: ['den', 'gokaden'],
    type: 'text',
    description: 'Sword-making tradition (Gokaden)',
    examples: ['tradition:Soshu', 'den:Yamashiro'],
  },
  {
    name: 'era',
    aliases: ['period', 'jidai'],
    type: 'text',
    description: 'Historical period',
    examples: ['era:Kamakura', 'period:Muromachi'],
  },
  {
    name: 'mei',
    aliases: ['signature', 'mei_status'],
    type: 'text',
    description: 'Signature status',
    examples: ['mei:signed', 'mei:mumei', 'mei:kinzogan'],
  },
  {
    name: 'nakago',
    aliases: ['tang', 'nakago_condition'],
    type: 'text',
    description: 'Tang condition',
    examples: ['nakago:ubu', 'nakago:suriage'],
  },
  {
    name: 'type',
    aliases: ['blade', 'blade_type', 'form'],
    type: 'text',
    description: 'Blade type/form',
    examples: ['type:tachi', 'type:katana', 'type:tanto'],
  },
  {
    name: 'smith',
    aliases: ['maker', 'tosho', 'craftsman'],
    type: 'text',
    description: 'Smith/maker name',
    examples: ['smith:Masamune'],
  },
  {
    name: 'hamon',
    aliases: ['hamon_pattern', 'temper'],
    type: 'text',
    description: 'Hamon pattern',
    examples: ['hamon:notare', 'hamon:choji'],
  },
  {
    name: 'hada',
    aliases: ['kitae', 'jihada', 'grain'],
    type: 'text',
    description: 'Hada (grain pattern)',
    examples: ['hada:itame', 'hada:mokume'],
  },
  {
    name: 'boshi',
    aliases: ['boshi_pattern', 'tip_temper'],
    type: 'text',
    description: 'Boshi pattern',
    examples: ['boshi:komaru'],
  },
  {
    name: 'sugata',
    aliases: ['shape', 'form_type'],
    type: 'text',
    description: 'Overall shape/form',
  },
  {
    name: 'mune',
    aliases: ['back', 'spine'],
    type: 'text',
    description: 'Mune (back/spine) type',
    examples: ['mune:iori'],
  },
  {
    name: 'collection',
    aliases: ['designation', 'class'],
    type: 'text',
    description: 'Collection (Tokuju or Juyo)',
    examples: ['collection:Tokuju'],
  },
  {
    name: 'volume',
    aliases: ['session', 'vol', 'book'],
    type: 'numeric',
    description: 'Volume/session number',
    examples: ['volume=6', 'session=1'],
  },
  {
    name: 'item_type',
    aliases: ['category'],
    type: 'text',
    description: 'Item type (token, tosogu, koshirae)',
    examples: ['item_type:token', 'item_type:tosogu'],
  },

  // Boolean fields
  {
    name: 'translated',
    aliases: ['has_translation', 'english'],
    type: 'boolean',
    description: 'Has English translation',
    examples: ['translated:true'],
  },
  {
    name: 'horimono',
    aliases: ['carving', 'engraving'],
    type: 'boolean',
    description: 'Has horimono (carvings)',
    examples: ['horimono:true'],
  },
  {
    name: 'origami',
    aliases: ['papers', 'certification'],
    type: 'boolean',
    description: 'Has origami (papers)',
  },

  // Array fields (for checking if value is in list)
  {
    name: 'yasurime',
    aliases: ['file_marks'],
    type: 'array',
    description: 'Yasurime (file marks) pattern',
  },
];

/**
 * Build a map from all aliases to canonical field names
 */
export const aliasMap: Map<string, string> = new Map();
for (const field of fieldDefinitions) {
  aliasMap.set(field.name.toLowerCase(), field.name);
  for (const alias of field.aliases) {
    aliasMap.set(alias.toLowerCase(), field.name);
  }
}

/**
 * Resolve an alias to its canonical field name
 */
export function resolveFieldName(input: string): string | null {
  return aliasMap.get(input.toLowerCase()) || null;
}

/**
 * Get field definition by name or alias
 */
export function getFieldDefinition(nameOrAlias: string): FieldDefinition | null {
  const canonical = resolveFieldName(nameOrAlias);
  if (!canonical) return null;
  return fieldDefinitions.find(f => f.name === canonical) || null;
}

/**
 * Extract a field value from a searchable item
 */
export function getFieldValue(item: SearchableItem, fieldName: string): string | number | boolean | string[] | null {
  const canonical = resolveFieldName(fieldName);
  if (!canonical) return null;

  const meta = item.metadata;

  switch (canonical) {
    // Numeric fields from measurements
    case 'nagasa':
      return item.nagasa ?? meta?.measurements?.nagasa ?? null;
    case 'sori':
      return meta?.measurements?.sori ?? null;
    case 'motohaba':
      return meta?.measurements?.motohaba ?? null;
    case 'sakihaba':
      return meta?.measurements?.sakihaba ?? null;
    case 'kasane':
      return meta?.measurements?.kasane ?? null;
    case 'kissaki':
      return meta?.measurements?.kissaki_nagasa ?? null;
    case 'nakago_length':
      return meta?.measurements?.nakago_nagasa ?? null;
    case 'mekugi':
      return meta?.nakago?.mekugi_ana ?? null;

    // Text fields
    case 'school':
      return item.school ?? meta?.smith?.school ?? meta?.maker?.school ?? null;
    case 'tradition':
      return item.tradition ?? meta?.smith?.tradition ?? null;
    case 'era':
      return item.era ?? meta?.era?.period ?? null;
    case 'mei':
      return item.meiStatus ?? meta?.mei?.status ?? null;
    case 'nakago':
      return item.nakagoCondition ?? meta?.nakago?.condition ?? null;
    case 'type':
      return item.bladeType ?? meta?.blade_type ?? meta?.fitting_type ?? meta?.mounting_type ?? null;
    case 'smith':
      return item.smithNameRomaji ?? meta?.smith?.name_romaji ?? meta?.maker?.name_romaji ?? null;
    case 'hamon':
      return meta?.hamon?.primary_pattern?.join(', ') ?? null;
    case 'hada':
      return meta?.kitae?.primary_hada?.join(', ') ?? null;
    case 'boshi':
      return meta?.boshi?.pattern?.join(', ') ?? null;
    case 'sugata':
      return meta?.sugata?.form ?? null;
    case 'mune':
      return meta?.sugata?.mune ?? null;
    case 'collection':
      return item.collection;
    case 'volume':
      return item.volume;
    case 'item_type':
      return item.itemType ?? meta?.item_type ?? null;

    // Boolean fields
    case 'translated':
      return item.hasTranslation;
    case 'horimono':
      return meta?.horimono?.present ?? null;
    case 'origami':
      return meta?.provenance?.origami?.present ?? null;

    // Array fields
    case 'yasurime':
      return meta?.nakago?.yasurime ?? null;

    default:
      return null;
  }
}

/**
 * Get all text content from an item for free-text searching
 * Note: Excludes lineage/comparative fields to avoid false matches
 * (e.g., "Masamune" matching students of Masamune)
 */
export function getSearchableText(item: SearchableItem): string {
  const meta = item.metadata;
  const parts: (string | null | undefined)[] = [
    // Primary identifying fields - these are the item's own attributes
    item.smithNameRomaji,
    item.smithNameKanji,
    item.school,
    item.bladeType,
    item.era,
    item.tradition,
    item.meiStatus,
    item.nakagoCondition,
    item.collection,

    // Smith/maker name (the actual maker of THIS item)
    meta?.smith?.name_romaji,
    meta?.smith?.name_kanji,
    meta?.smith?.school,
    meta?.smith?.tradition,
    // EXCLUDED: meta?.smith?.lineage - contains references to other smiths
    meta?.maker?.name_romaji,
    meta?.maker?.name_kanji,
    meta?.maker?.school,

    // Era and dating
    meta?.era?.period,
    meta?.era?.sub_period,
    meta?.era?.nengo,

    // Physical characteristics
    meta?.blade_type,
    meta?.mei?.status,
    meta?.mei?.inscription_omote,
    meta?.mei?.inscription_ura,
    meta?.nakago?.condition,
    meta?.nakago?.shape,
    meta?.sugata?.form,
    meta?.sugata?.mune,
    meta?.sugata?.kissaki,

    // Technical details (arrays)
    meta?.hamon?.primary_pattern?.join(' '),
    meta?.hamon?.activities?.join(' '),
    meta?.kitae?.primary_hada?.join(' '),
    meta?.kitae?.characteristics?.join(' '),
    meta?.boshi?.pattern?.join(' '),
    meta?.boshi?.features?.join(' '),
    meta?.horimono?.types?.join(' '),
    meta?.nakago?.yasurime?.join(' '),
    // EXCLUDED: meta?.provenance?.denrai - may reference other people/smiths
    // EXCLUDED: meta?.assessment?.praise_tags - may contain comparative references
  ];

  return parts.filter(Boolean).join(' ').toLowerCase();
}

/**
 * List of all searchable field names (for auto-complete)
 */
export function getAllFieldNames(): string[] {
  const names: string[] = [];
  for (const field of fieldDefinitions) {
    names.push(field.name);
    names.push(...field.aliases);
  }
  return [...new Set(names)].sort();
}
