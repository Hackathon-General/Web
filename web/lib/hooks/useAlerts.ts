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

export interface AlertDoc {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  title: string;
  message: string;
  createdAt: number;
}

/** Subscribe to all GPS alerts in real-time. */
export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setAlerts(
        snap.docs.map((d) => {
          const data = d.data() as DocumentData;
          return { id: d.id, ...data } as AlertDoc;
        })
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { alerts, loading };
}
