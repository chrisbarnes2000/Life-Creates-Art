import * as admin from 'firebase-admin';
import firebaseConfig from '../../firebase-applet-config.json';
import crypto from 'crypto';

function ensureInit() {
  if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      console.warn("WARNING: FIREBASE_SERVICE_ACCOUNT_KEY is not defined. Initializing with fallback configuration.");
      admin.initializeApp({
        projectId: 'life-creates-art',
        storageBucket: 'life-creates-art.firebasestorage.app',
      });
      return;
    }
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'life-creates-art.firebasestorage.app',
      });
    } catch (err) {
      console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:", err);
      admin.initializeApp({
        projectId: 'life-creates-art',
        storageBucket: 'life-creates-art.firebasestorage.app',
      });
    }
  }
}

export const db = new Proxy({} as admin.firestore.Firestore, {
  get(_, prop) {
    ensureInit();
    const dbId = (!firebaseConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId === 'default')
      ? undefined
      : firebaseConfig.firestoreDatabaseId;
    const firestoreInstance = dbId ? admin.firestore(dbId) : admin.firestore();
    const value = Reflect.get(firestoreInstance, prop);
    if (typeof value === 'function') {
      return value.bind(firestoreInstance);
    }
    return value;
  }
});

export const storage = new Proxy({} as admin.storage.Storage, {
  get(_, prop) {
    ensureInit();
    const storageInstance = admin.storage();
    const value = Reflect.get(storageInstance, prop);
    if (typeof value === 'function') {
      return value.bind(storageInstance);
    }
    return value;
  }
});

export const auth = new Proxy({} as admin.auth.Auth, {
  get(_, prop) {
    ensureInit();
    const authInstance = admin.auth();
    const value = Reflect.get(authInstance, prop);
    if (typeof value === 'function') {
      return value.bind(authInstance);
    }
    return value;
  }
});

export const bucket = new Proxy({} as any, {
  get(_, prop) {
    ensureInit();
    const bucketInstance = admin.storage().bucket();
    const value = Reflect.get(bucketInstance, prop);
    if (typeof value === 'function') {
      return value.bind(bucketInstance);
    }
    return value;
  }
});

export async function getOrCreateDownloadUrl(path: string): Promise<string> {
  ensureInit();
  const bucketInstance = admin.storage().bucket();
  const fileRef = bucketInstance.file(path);
  const bucketName = bucketInstance.name;
  
  try {
    const [exists] = await fileRef.exists();
    if (!exists) {
      return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media`;
    }
    
    const [metadata] = await fileRef.getMetadata();
    let token = metadata.metadata?.firebaseStorageDownloadTokens;
    
    if (!token) {
      token = crypto.randomUUID();
      await fileRef.setMetadata({
        metadata: {
          firebaseStorageDownloadTokens: token
        }
      });
    }
    
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
  } catch (error) {
    console.error(`Error getting or creating download URL for ${path}:`, error);
    // Secure fallback: construct standard format even if offline
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media`;
  }
}

