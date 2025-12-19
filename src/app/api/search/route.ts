import { NextRequest, NextResponse } from 'next/server';
import { searchItems } from '@/lib/data';
import type { Collection, SearchFilters } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const filters: SearchFilters = {
    query: searchParams.get('q') || '',
    collection: searchParams.get('collection') as Collection | undefined,
    bladeType: searchParams.get('bladeType') || undefined,
    school: searchParams.get('school') || undefined,
    tradition: searchParams.get('tradition') || undefined,
    period: searchParams.get('period') || undefined,
    hasTranslation: searchParams.get('hasTranslation') === 'true' ? true : undefined,
  };

  try {
    const results = searchItems(filters);

    // Add image URLs to results
    const itemsWithImages = results.items.map(item => {
      const volStr = String(item.volume).padStart(3, '0');
      const itemStr = String(item.item).padStart(3, '0');
      return {
        ...item,
        oshigataUrl: `/api/image/${item.collection}/vol_${volStr}/item_${itemStr}_oshigata.jpg`,
      };
    });

    return NextResponse.json({
      ...results,
      items: itemsWithImages,
    });
  } catch (error) {
    console.error('Error searching items:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
