import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Storage is not used — it requires the paid Blaze plan.
// Images are compressed client-side and stored inline in Firestore instead (see src/lib/api/image.ts).
const firebaseConfig = {
  apiKey: 'AIzaSyAYQq7Bihj6aEkKF7oYZCzPcPhnOGnN3dQ',
  authDomain: 'hobnob-clone.firebaseapp.com',
  projectId: 'hobnob-clone',
  storageBucket: 'hobnob-clone.firebasestorage.app',
  messagingSenderId: '397595160538',
  appId: '1:397595160538:web:395890226be54d69311ae3',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
