import { NextRequest } from 'next/server';
import { bucket } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');

    if (!path) {
      return new Response('Path is required', { status: 400 });
    }

    const file = bucket.file(path);
    const [exists] = await file.exists();

    if (!exists) {
      return new Response('File not found', { status: 404 });
    }

    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || 'application/octet-stream';

    const stream = file.createReadStream();

    return new Response(stream as any, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Preview error:', error);
    return new Response(error.message || 'Internal Server Error', { status: 500 });
  }
}
