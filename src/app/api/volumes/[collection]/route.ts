import { NextRequest, NextResponse } from 'next/server';
import { listVolumes } from '@/lib/data';
import type { Collection } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params;

  // Validate collection
  if (collection !== 'Tokuju' && collection !== 'Juyo') {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  try {
    const volumes = listVolumes(collection as Collection);
    return NextResponse.json({ volumes });
  } catch (error) {
    console.error('Error fetching volumes:', error);
    return NextResponse.json({ error: 'Failed to fetch volumes' }, { status: 500 });
  }
}
