import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function PATCH(req: Request) {
  try {
    const { id, description, album, subAlbum, hoverText } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const docRef = db.collection('gallery').doc(id);
    const updateData: any = {
      lastUpdated: new Date(),
    };

    if (description !== undefined) updateData.description = description;
    if (album !== undefined) updateData.album = album;
    if (subAlbum !== undefined) updateData.subAlbum = subAlbum;
    if (hoverText !== undefined) updateData.hoverText = hoverText;

    await docRef.update(updateData);

    return NextResponse.json({ message: 'Metadata updated successfully' });
  } catch (error) {
    console.error('Error updating gallery metadata:', error);
    return NextResponse.json({ error: 'Failed to update metadata' }, { status: 500 });
  }
}
