/**
 * Firebase Web SDK — single source for all Firebase service instances.
 * Mirrors the App's src/firebase/index.ts but uses the Web SDK.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAq2AoFcZUYhc9mSb_cu3kH-p-I_ToLTzA",
  authDomain: "carmel-kinneret.firebaseapp.com",
  projectId: "carmel-kinneret",
  storageBucket: "carmel-kinneret.firebasestorage.app",
  messagingSenderId: "765131472287",
  appId: "1:765131472287:web:carmelkinneretweb",
  databaseURL:
    "https://carmel-kinneret-default-rtdb.europe-west1.firebasedatabase.app",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "europe-west1");
