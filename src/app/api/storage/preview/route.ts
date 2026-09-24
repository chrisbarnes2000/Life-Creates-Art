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
    const fileSize = Number(metadata.size || 0);
    const contentType = metadata.contentType || 'application/octet-stream';
    const range = req.headers.get('range');

    if (range && fileSize > 0) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const stream = file.createReadStream({ start, end });

      return new Response(stream as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunksize),
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } else {
      const stream = file.createReadStream();
      return new Response(stream as any, {
        headers: {
          'Accept-Ranges': 'bytes',
          ...(fileSize > 0 ? { 'Content-Length': String(fileSize) } : {}),
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch (error: any) {
    console.error('Preview error:', error);
    return new Response(error.message || 'Internal Server Error', { status: 500 });
  }
}
