"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { db, rtdb } from "@/lib/firebase";

export interface LeaderboardRow {
  id: string;
  displayName?: string;
  totalKm?: number;
  email?: string;
  photoURL?: string;
}

/** Subscribe to top users sorted by totalKm + community km bank. */
export function useLeaderboard(max = 20) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [communityKm, setCommunityKm] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("totalKm", "desc"),
      limit(max)
    );
    const unsub = onSnapshot(q, (snap) =>
      setRows(
        snap.docs.map(
          (d) => ({ id: d.id, ...(d.data() as object) }) as LeaderboardRow
        )
      )
    );
    return () => unsub();
  }, [max]);

  useEffect(() => {
    const unsub = onValue(ref(rtdb, "community/totalKm"), (s) =>
      setCommunityKm(Number(s.val()) || 0)
    );
    return () => unsub();
  }, []);

  return { rows, communityKm };
}
