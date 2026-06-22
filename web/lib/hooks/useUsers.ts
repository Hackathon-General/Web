"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface UserProfile {
  id: string;
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  role: "user" | "admin";
  provider?: string;
  isAnonymous?: boolean;
  stationsVisited?: string[];
  totalKm?: number;
  createdAt?: number;
  lastActiveAt?: number;
}

/** Subscribe to all user profiles. */
export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(
        snap.docs.map((d) => {
          const data = d.data() as DocumentData;
          return { id: d.id, ...data } as UserProfile;
        })
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { users, loading };
}
