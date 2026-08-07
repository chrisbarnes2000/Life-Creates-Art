import { NextResponse } from 'next/server';
import { bucket, db, getOrCreateDownloadUrl } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    let targetPath = formData.get('path') as string | null;
    const autoAdopt = formData.get('autoAdopt') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided for upload' }, { status: 400 });
    }

    // Resolve target path
    if (!targetPath) {
      targetPath = `gallery/${file.name}`;
    } else {
      // Clean up slash repetitions
      targetPath = targetPath.trim().replace(/\/+/g, '/');
      if (targetPath.endsWith('/')) {
        targetPath = `${targetPath}${file.name}`;
      } else if (!targetPath.split('/').pop()?.includes('.')) {
        // If it's just a folder name without trailing slash, e.g. "gallery/Barns"
        targetPath = `${targetPath}/${file.name}`;
      }
    }

    // Ensure it doesn't start with /
    if (targetPath.startsWith('/')) {
      targetPath = targetPath.substring(1);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucketFile = bucket.file(targetPath);

    await bucketFile.save(buffer, {
      metadata: {
        contentType: file.type || 'image/jpeg',
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Get or generate a secure download URL with a persistent Firebase Storage token
    const imageUrl = await getOrCreateDownloadUrl(targetPath);

    let adopted = false;
    if (autoAdopt && targetPath.startsWith('gallery/')) {
      const parts = targetPath.split('/');
      const fileName = parts[parts.length - 1];
      const album = parts.length > 2 ? parts[1] : null;

      // Check if it already exists in Firestore to avoid duplicates
      const existing = await db.collection('gallery').where('storagePath', '==', targetPath).get();
      if (existing.empty) {
        await db.collection('gallery').add({
          imageUrl,
          storagePath: targetPath,
          description: fileName.replace(/_/g, ' ').split('.')[0] || 'Uploaded Asset',
          album,
          uploadDate: new Date(),
          lastUpdated: new Date()
        });
        adopted = true;
      }
    }

    return NextResponse.json({
      success: true,
      message: adopted 
        ? `Successfully uploaded and adopted: ${targetPath}` 
        : `Successfully uploaded: ${targetPath}`,
      path: targetPath,
      imageUrl,
      adopted
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload file to storage' }, { status: 500 });
  }
}
