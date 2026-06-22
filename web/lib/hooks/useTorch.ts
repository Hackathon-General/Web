"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";

export interface TorchState {
  status: "waiting" | "held";
  lat: number;
  lng: number;
  holderId?: string;
  holderName?: string;
  heldSince?: number;
  source?: "phone" | "sensor";
}

/** Subscribe to the live torch state. */
export function useTorch() {
  const [torch, setTorch] = useState<TorchState | null>(null);

  useEffect(() => {
    const unsub = onValue(ref(rtdb, "torch/active"), (snap) => {
      setTorch((snap.val() as TorchState | null) ?? null);
    });
    return () => unsub();
  }, []);

  return { torch };
}
