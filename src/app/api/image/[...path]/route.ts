import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_ROOT = process.env.OSHI_DATA_PATH || '/Users/christopherhill/Desktop/Claude_project/Oshi_data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;

  // Reconstruct the file path
  // Expected format: /api/image/[collection]/[volume]/[filename]
  // e.g., /api/image/Tokuju/vol_001/item_001_oshigata.jpg
  const filePath = path.join(DATA_ROOT, 'data', 'processed', ...pathSegments);

  // Security check: ensure path is within DATA_ROOT
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(DATA_ROOT))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Check if file exists
  if (!fs.existsSync(resolvedPath)) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Read and return the image
  try {
    const imageBuffer = fs.readFileSync(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();

    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error reading image:', error);
    return new NextResponse('Error reading file', { status: 500 });
  }
}
