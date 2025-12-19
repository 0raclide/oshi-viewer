import { NextRequest, NextResponse } from 'next/server';
import { listItems } from '@/lib/data';
import type { Collection } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; volume: string }> }
) {
  const { collection, volume } = await params;

  // Validate collection
  if (collection !== 'Tokuju' && collection !== 'Juyo') {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  const volumeNum = parseInt(volume, 10);
  if (isNaN(volumeNum) || volumeNum < 1) {
    return NextResponse.json({ error: 'Invalid volume number' }, { status: 400 });
  }

  try {
    const items = listItems(collection as Collection, volumeNum);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}
