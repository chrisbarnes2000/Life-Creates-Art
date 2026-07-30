import { NextResponse } from 'next/server';
import { bucket } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const [files] = await bucket.getFiles();
    const filePaths = files.map(file => file.name);
    return NextResponse.json({ 
      files: filePaths,
      bucketName: bucket.name 
    });
  } catch (error) {
    // Suppressed warning
    return NextResponse.json({ 
      files: [], 
      bucketName: 'limited-or-missing-bucket',
      warning: 'Storage listing is disabled or unavailable under the current backend credentials.'
    });
  }
}
