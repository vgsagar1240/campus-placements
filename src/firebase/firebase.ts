import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
// import { getStorage } from 'firebase/storage'; // Not needed for free plan

const firebaseConfig = {
  apiKey: "AIzaSyCToHuQhYdw4pu3I9fFZaGc09WOmBhSqDo",
  authDomain: "campus-placement-3176b.firebaseapp.com",
  projectId: "campus-placement-3176b",
  storageBucket: "campus-placement-3176b.firebasestorage.app",
  messagingSenderId: "794476874501",
  appId: "1:794476874501:web:4bdf732137720ad2f1c56c",
  measurementId: "G-ZEHCXKCPSE"
};

// Debug: Log configuration (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId ? 'Present' : 'Missing',
    measurementId: firebaseConfig.measurementId,
    envVarsLoaded: {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    }
  });
}

// Initialize Firebase app with error handling
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully');
  } else {
    app = getApp();
    console.log('✅ Using existing Firebase app');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  // Don't throw error, let the app continue
  app = null;
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Initialize Analytics (only in browser environment)
export const analytics = app && typeof window !== 'undefined' ? getAnalytics(app) : null;

// export const storage = getStorage(app); // Not needed for free plan
