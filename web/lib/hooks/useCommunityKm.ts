"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";

/** Subscribe to the RTDB community/totalKm counter. */
export function useCommunityKm() {
  const [km, setKm] = useState(0);

  useEffect(() => {
    const unsub = onValue(ref(rtdb, "community/totalKm"), (s) =>
      setKm(Number(s.val()) || 0)
    );
    return () => unsub();
  }, []);

  return km;
}
