"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Role = "user" | "admin";

interface AuthCtx {
  user: User | null;
  role: Role;
  initializing: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

const googleProvider = new GoogleAuthProvider();

/**
 * Ensure a users/{uid} profile exists (mirrors App's AuthProvider).
 */
async function ensureProfile(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(
    ref,
    {
      uid: user.uid,
      role: "user",
      provider: user.isAnonymous ? "anonymous" : "google",
      isAnonymous: user.isAnonymous,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      email: user.email ?? null,
      stationsVisited: [],
      totalKm: 0,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    },
    { merge: true }
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("user");
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        ensureProfile(u).catch(() => {});
        const token = await u.getIdTokenResult();
        setRole(
          (token.claims.role as Role) === "admin" ? "admin" : "user"
        );
      } else {
        setRole("user");
      }
      setInitializing(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = useMemo(
    () => ({ user, role, initializing, signInWithGoogle, signOut }),
    [user, role, initializing]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
