"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useLive } from "@/hooks/useLive";
import MapComponent from "./MapComponent";
import LoginScreen from "./LoginScreen";
import stations from '../content/stations.json';
import routes from '../content/routes.json';

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // האזנה למצב החיבור של המשתמש (Auth State)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // הפעלת ה-Hook של ה-RTDB (ייקרא רק כשיש משתמש מחובר)
  const liveData = useLive(); 

  // נרמול הנתונים מה-Hook
  const livePinsFromDb = Array.isArray(liveData) 
    ? liveData 
    : (liveData && typeof liveData === 'object' && 'pins' in liveData && Array.isArray((liveData as any).pins))
      ? (liveData as any).pins 
      : [];

  const activeSensorsCount = livePinsFromDb.filter((p: any) => p.source === "sensor").length;
  const activePhonesCount = livePinsFromDb.filter((p: any) => p.source !== "sensor").length;

  const handleLogout = () => {
    signOut(auth);
  };

  // מסך טעינה בזמן בדיקת ה-Session בגוגל
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FEF6ED] text-[#2C6E49] font-sans font-bold">
        🔄 בודק הרשאות גישה...
      </div>
    );
  }

  // הגנה: אם המשתמש לא מחובר, חסום את העמוד והצג מסך התחברות
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen w-full flex-col md:flex-row bg-slate-950 font-sans text-slate-100 overflow-hidden">
      
      {/* 💻 סרגל צד חמ"ל */}
      <div className="w-full md:w-80 p-6 bg-slate-900 border-b md:border-b-0 md:border-l border-slate-800 flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">חמ"ל שביל</h1>
            <p className="text-emerald-400 font-bold text-sm tracking-wide">כרמל ־ כנרת</p>
            <div className="flex items-center justify-between mt-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                מחובר: {user.displayName || "מנהל"}
              </span>
              <button 
                onClick={handleLogout}
                className="text-[10px] text-red-400 hover:underline cursor-pointer"
              >
                התנתק ✕
              </button>
            </div>
          </div>

          {/* ווידג'ט סיכום רצים בזמן אמת */}
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
              <span className="text-xs font-medium text-slate-400 block mb-1">סה"כ אותות אקטיביים בשטח:</span>
              <span className="text-4xl font-black text-blue-400 tracking-tight">
                {livePinsFromDb.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
                <span className="text-slate-400 block mb-0.5">📟 חיישני IoT</span>
                <span className="text-base font-bold text-purple-400">{activeSensorsCount}</span>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
                <span className="text-slate-400 block mb-0.5">📱 טלפונים</span>
                <span className="text-base font-bold text-emerald-400">{activePhonesCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/60 text-[11px] text-slate-500 text-center">
          מערכת סנכרון מרכזית • מוגנת ב-Auth
        </div>
      </div>

      {/* 🗺️ אזור המפה */}
      <div className="flex-1 h-full relative bg-slate-950">
        <MapComponent 
          stations={stations} 
          routes={routes.waypoints || []} 
          livePins={livePinsFromDb} 
          torch={null}
        />
      </div>

    </div>
  );
}