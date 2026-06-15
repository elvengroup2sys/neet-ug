import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
  query,
  limit,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Firebase is optional during early development - only initialize if all
// required config values are present so the app never crashes to a blank screen.
export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

let app = null
let auth = null
let db = null
let googleProvider = null

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  googleProvider = new GoogleAuthProvider()
}

export { app, auth, db }

export function watchAuthState(callback) {
  if (!auth) return () => {}
  return onAuthStateChanged(auth, callback)
}

export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error('Firebase is not configured.')
  }
  return signInWithPopup(auth, googleProvider)
}

export async function signOutUser() {
  if (!auth) return
  return signOut(auth)
}

// Fetches a batch of PYQs from the `pyqs` collection. Returns an empty
// array if Firebase isn't configured or the collection is empty, so callers
// can fall back to local sample data.
export async function fetchPyqs(count = 20) {
  if (!db) return []
  const snapshot = await getDocs(query(collection(db, 'pyqs'), limit(count)))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

// Records an attempt at a PYQ and updates the student's weak-topics list.
// No-ops if Firebase isn't configured so the practice flow still works
// without a backend during development.
export async function recordAttempt(uid, pyq, isCorrect) {
  if (!db || !uid) return
  const ref = doc(db, 'progress', uid)
  await setDoc(
    ref,
    {
      attempted: { [pyq.id]: isCorrect ? 'correct' : 'wrong' },
      weakTopics: isCorrect ? arrayRemove(pyq.topic) : arrayUnion(pyq.topic),
      lastStudied: serverTimestamp(),
    },
    { merge: true },
  )
}
