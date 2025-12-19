import { NextResponse } from 'next/server';
import { getCollectionStats } from '@/lib/data';

export async function GET() {
  try {
    const tokujuStats = getCollectionStats('Tokuju');
    const juyoStats = getCollectionStats('Juyo');

    return NextResponse.json({
      collections: [
        {
          id: 'Tokuju',
          nameJa: '特別重要',
          nameEn: 'Tokubetsu Juyo',
          description: 'Special Designation swords',
          ...tokujuStats,
        },
        {
          id: 'Juyo',
          nameJa: '重要',
          nameEn: 'Juyo',
          description: 'Important Designation swords',
          ...juyoStats,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}
