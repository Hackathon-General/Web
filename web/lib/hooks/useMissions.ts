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

export interface NFR {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  title: string;
  task: string;
  active: boolean;
  createdAt: number;
}

/** Subscribe to all NFR missions in real-time. */
export function useMissions() {
  const [missions, setMissions] = useState<NFR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "nfrs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setMissions(
        snap.docs.map((d) => {
          const data = d.data() as DocumentData;
          return { id: d.id, ...data } as NFR;
        })
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { missions, loading };
}
