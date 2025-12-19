import { NextRequest, NextResponse } from 'next/server';
import { getItemData } from '@/lib/data';
import type { Collection, ItemReference } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; volume: string; item: string }> }
) {
  const { collection, volume, item } = await params;

  // Validate collection
  if (collection !== 'Tokuju' && collection !== 'Juyo') {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  const volumeNum = parseInt(volume, 10);
  const itemNum = parseInt(item, 10);

  if (isNaN(volumeNum) || volumeNum < 1) {
    return NextResponse.json({ error: 'Invalid volume number' }, { status: 400 });
  }

  if (isNaN(itemNum) || itemNum < 1) {
    return NextResponse.json({ error: 'Invalid item number' }, { status: 400 });
  }

  try {
    const ref: ItemReference = {
      collection: collection as Collection,
      volume: volumeNum,
      item: itemNum,
    };

    const data = getItemData(ref);

    // Build image URLs
    const volStr = String(volumeNum).padStart(3, '0');
    const itemStr = String(itemNum).padStart(3, '0');

    return NextResponse.json({
      reference: ref,
      ...data,
      images: {
        oshigata: `/api/image/${collection}/vol_${volStr}/item_${itemStr}_oshigata.jpg`,
        setsumei: `/api/image/${collection}/vol_${volStr}/item_${itemStr}_setsumei.jpg`,
      },
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}
