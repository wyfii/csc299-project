import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCZsi5RaDwItGNf_KPee_2d9EsNJDtLsDI",
  authDomain: "nova-a42e0.firebaseapp.com",
  projectId: "nova-a42e0",
  storageBucket: "nova-a42e0.firebasestorage.app",
  messagingSenderId: "860515347103",
  appId: "1:860515347103:web:713c7cdb6195b7f14b90aa",
  measurementId: "G-WMW4B4G9S1",
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics only on client side
let analytics: any = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, db, analytics };
