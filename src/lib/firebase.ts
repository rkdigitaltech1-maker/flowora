// Firebase is loaded dynamically to avoid build errors when package is not yet installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _app: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _auth: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _googleProvider: any = null;

async function initFirebase() {
  try {
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const { getAuth, GoogleAuthProvider } = await import("firebase/auth");

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    _auth = getAuth(_app);
    _googleProvider = new GoogleAuthProvider();
    _googleProvider.addScope("profile");
    _googleProvider.addScope("email");
  } catch (e) {
    console.warn("Firebase not available:", e);
  }
}

initFirebase();

export const getFirebaseAuth = () => _auth;
export const getGoogleProvider = () => _googleProvider;
export const getFirebaseApp = () => _app;

// Legacy named exports for compatibility
export const auth = new Proxy({} as any, {
  get: (_t, prop) => _auth?.[prop],
});
export const googleProvider = new Proxy({} as any, {
  get: (_t, prop) => _googleProvider?.[prop],
});

export default new Proxy({} as any, {
  get: (_t, prop) => _app?.[prop],
});
