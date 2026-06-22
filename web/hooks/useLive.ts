import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase'; // ודא שנתיב הייבוא ל-rtdb שהגדרנו קודם נכון

export interface LivePin {
  id: string;
  lat: number;
  lng: number;
  speed?: number;
  ts: number;
  source: 'phone' | 'sensor';
  name?: string;
}

/** * מאזין בזמן אמת לכל נקודות הציון החיות (טלפונים וחיישני IoT)
 * עבור מפת ה-God-Mode של מנהלי המערכת.
 */
export function useLive() {
  const [pins, setPins] = useState<LivePin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // מאזין לנתיב הראשי של המיקומים החיים
    const liveRef = ref(rtdb, 'live');
    
    const unsub = onValue(liveRef, (snap) => {
      const val = (snap.val() as Record<string, Omit<LivePin, 'id'>>) || {};
      
      // הפיכת האובייקט שחוזר מה-DB למערך של סיכות עם ה-ID שלהן
      const parsedPins = Object.entries(val).map(([id, p]) => ({
        id,
        ...p,
      }));
      
      setPins(parsedPins);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching live tracking data:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { pins, loading };
}