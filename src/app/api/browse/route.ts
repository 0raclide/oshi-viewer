import { NextResponse } from 'next/server';
import { getBrowseItems } from '@/lib/data';
import type { Collection } from '@/types';

// Cache browse results for 1 hour - data is static
export const revalidate = 3600;

// Validation constants
const VALID_COLLECTIONS: Collection[] = ['Tokuju', 'Juyo'];
const MAX_QUERY_LENGTH = 500;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Validate and sanitize query parameter
  let query = searchParams.get('q') || undefined;
  if (query && query.length > MAX_QUERY_LENGTH) {
    query = query.slice(0, MAX_QUERY_LENGTH);
  }

  // Validate collection parameter
  const collectionParam = searchParams.get('collection');
  let collection: Collection | undefined;
  if (collectionParam) {
    if (VALID_COLLECTIONS.includes(collectionParam as Collection)) {
      collection = collectionParam as Collection;
    } else {
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }
  }

  // Validate volume parameter
  const volumeParam = searchParams.get('volume');
  let volume: number | undefined;
  if (volumeParam) {
    volume = parseInt(volumeParam, 10);
    if (isNaN(volume) || volume < 1) {
      return NextResponse.json({ error: 'Invalid volume number' }, { status: 400 });
    }
  }

  const filters = {
    query,
    collection,
    volume,
    itemType: searchParams.get('itemType') || undefined,
    era: searchParams.get('era') || undefined,
    school: searchParams.get('school') || undefined,
    tradition: searchParams.get('tradition') || undefined,
    bladeType: searchParams.get('bladeType') || undefined,
    smith: searchParams.get('smith') || undefined,
    meiStatus: searchParams.get('meiStatus') || undefined,
    nakagoCondition: searchParams.get('nakagoCondition') || undefined,
    denrai: searchParams.get('denrai') || undefined,
    kiwame: searchParams.get('kiwame') || undefined,
    isEnsemble: searchParams.get('isEnsemble') === 'true' ? true : undefined,
    hasTranslation: searchParams.get('hasTranslation') === 'true' ? true :
                    searchParams.get('hasTranslation') === 'false' ? false : undefined,
  };

  const result = getBrowseItems(filters);

  return NextResponse.json(result);
}
