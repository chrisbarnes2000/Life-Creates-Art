import * as admin from 'firebase-admin';

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
    const firestoreInstance = admin.firestore();
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
