require('dotenv').config();
const admin = require('firebase-admin');
admin.initializeApp({
  projectId: 'life-creates-art',
  storageBucket: 'life-creates-art.firebasestorage.app',
});
const bucket = admin.storage().bucket();
bucket.getFiles().then(res => {
  console.log('Files:', res[0].map(f => f.name).join(', '));
}).catch(err => {
  console.error('Error:', err.message);
});
