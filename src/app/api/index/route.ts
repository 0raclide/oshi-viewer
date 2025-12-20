import { NextResponse } from 'next/server';
import { listVolumes, getCollectionStats } from '@/lib/data';
import type { Collection } from '@/types';

// Cache index data for 1 hour - data is static
export const revalidate = 3600;

export interface CollectionIndex {
  collection: Collection;
  label: string;
  labelJp: string;
  description: string;
  totalVolumes: number;
  totalItems: number;
  volumesWithTranslations: number;
  itemsWithTranslations: number;
  volumes: {
    volume: number;
    itemCount: number;
    hasTranslations: boolean;
    translatedCount: number;
  }[];
}

export async function GET() {
  const collections: Collection[] = ['Tokuju', 'Juyo'];

  const index: CollectionIndex[] = collections.map(collection => {
    const volumes = listVolumes(collection);
    const stats = getCollectionStats(collection);

    // Count items with translations
    let itemsWithTranslations = 0;
    const volumeDetails = volumes.map(vol => {
      // For volumes with translations, count translated items
      // (For now, assume all items in a translated volume have translations)
      const translatedCount = vol.hasTranslations ? vol.itemCount : 0;
      itemsWithTranslations += translatedCount;

      return {
        volume: vol.volume,
        itemCount: vol.itemCount,
        hasTranslations: vol.hasTranslations,
        translatedCount,
      };
    });

    const labels: Record<Collection, { label: string; labelJp: string; description: string }> = {
      'Tokuju': {
        label: 'Tokubetsu Juyo Token',
        labelJp: '特別重要刀剣',
        description: 'Special Important Swords - The highest designation by NBTHK',
      },
      'Juyo': {
        label: 'Juyo Token',
        labelJp: '重要刀剣',
        description: 'Important Swords - High-quality swords designated by NBTHK',
      },
    };

    return {
      collection,
      ...labels[collection],
      totalVolumes: stats.totalVolumes,
      totalItems: stats.totalItems,
      volumesWithTranslations: stats.volumesWithTranslations,
      itemsWithTranslations,
      volumes: volumeDetails,
    };
  });

  return NextResponse.json({
    collections: index,
    summary: {
      totalCollections: index.length,
      totalVolumes: index.reduce((sum, c) => sum + c.totalVolumes, 0),
      totalItems: index.reduce((sum, c) => sum + c.totalItems, 0),
      totalTranslated: index.reduce((sum, c) => sum + c.itemsWithTranslations, 0),
    },
  });
}
