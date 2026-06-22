"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { rtdb } from '../../lib/firebase';
import { ref, onValue } from 'firebase/database';

// שימוש בנתונים הרשמיים שהעלית מתוך תיקיית התוכן של האפליקציה
import stationsData from '../content/stations.json';
import routesData from '../content/routes.json';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center text-slate-400">
      🛰️ טוען מפת חמ"ל חיה...
    </div>
  ),
});

interface LivePin {
  id: string;
  lat: number;
  lng: number;
  speed?: number;
  ts: number;
  source: 'phone' | 'sensor';
  name?: string;
}

export default function AdminDashboard() {
  const [pins, setPins] = useState<LivePin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSource, setFilterSource] = useState<'all' | 'phone' | 'sensor'>('all');

  useEffect(() => {
    const liveRef = ref(rtdb, 'live');
    
    const unsub = onValue(liveRef, (snap) => {
      const val = (snap.val() as Record<string, any>) || {};
      
      const parsedPins = Object.entries(val).map(([id, p]) => ({
        id,
        lat: p.lat,
        lng: p.lng,
        speed: p.speed,
        ts: p.ts,
        name: p.name,
        // התאמה מדויקת לחוקי ה-DB שלך: אם שדה source לא קיים, מדובר בסמארטפון (phone)
        source: p.source === 'sensor' ? 'sensor' : 'phone'
      }));
      
      setPins(parsedPins);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching live pins from RTDB:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredPins = pins.filter(pin => {
    if (filterSource === 'all') return true;
    return pin.source === filterSource;
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-4 flex flex-col gap-4 font-sans bg-[#FEF6ED] min-h-screen">
      
      {/* כותרת החמ"ל */}
      <div className="p-4 bg-[#2A3C2C] text-white rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-2 shadow-sm">
        <div>
          <h2 className="text-lg font-black tracking-wide">חמ"ל שביל כרמל-כנרת</h2>
          <p className="text-xs text-amber-200">מסך בקרה, ניטור ואינטגרציית אותות קצה בזמן אמת</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-md">
            {loading ? "מתחבר..." : "שידור חי אקטיבי"}
          </span>
        </div>
      </div>

      {/* אזור העבודה: מפה וסיידבר בקרה */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-140px)] min-h-[500px]">
        
        {/* המפה - מציגה את התחנות האמיתיות, תוואי ה-Waze והמשתמשים מה-RTDB */}
        <div className="lg:col-span-3 bg-white border border-[#F0F0F0] rounded-2xl p-2 shadow-sm relative h-full">
          <MapComponent 
            torch={null} 
            stations={stationsData.stations} 
            routes={routesData.waypoints}   
            livePins={filteredPins} 
          />
        </div>

        {/* סיידבר ניטור וסינון */}
        <div className="bg-white border border-[#F0F0F0] rounded-2xl p-4 shadow-sm flex flex-col gap-4 h-full overflow-hidden">
          <div>
            <h3 className="text-sm font-black text-[#212121] mb-1">מסנני תצוגה</h3>
            <p className="text-[11px] text-[#646464]">בחר אילו אותות להציג על גבי המפה המרכזית</p>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-[#FEF6ED] p-1 rounded-xl border border-[#F0F0F0] text-[11px] font-bold">
            <button onClick={() => setFilterSource('all')} className={`py-2 rounded-lg transition-all ${filterSource === 'all' ? 'bg-[#2C6E49] text-white shadow' : 'text-[#646464]'}`}>
              הכל ({pins.length})
            </button>
            <button onClick={() => setFilterSource('phone')} className={`py-2 rounded-lg transition-all ${filterSource === 'phone' ? 'bg-blue-600 text-white shadow' : 'text-[#646464]'}`}>
              📱 סלולר
            </button>
            <button onClick={() => setFilterSource('sensor')} className={`py-2 rounded-lg transition-all ${filterSource === 'sensor' ? 'bg-purple-600 text-white shadow' : 'text-[#646464]'}`}>
              👕 IoT
            </button>
          </div>

          <hr className="border-[#F0F0F0]" />

          {/* רשימת האותות שנקלטו */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <h4 className="text-[11px] font-bold text-[#646464] sticky top-0 bg-white pb-1">מכשירים משדרים בשטח ({filteredPins.length})</h4>
            
            {filteredPins.map((pin) => (
              <div key={pin.id} className="p-2.5 rounded-xl border border-[#F0F0F0] bg-slate-50 flex justify-between items-center text-xs hover:border-[#D68C45] transition-all">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#212121] block truncate max-w-[140px]">
                    {pin.source === 'sensor' ? `חיישן חולצה #${pin.id}` : (pin.name || 'צועד אנונימי')}
                  </span>
                  <span className="text-[10px] text-[#646464] block">
                    {new Date(pin.ts).toLocaleTimeString('he-IL')}
                  </span>
                </div>

                <div className="text-left space-y-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded block ${pin.source === 'sensor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {pin.source === 'sensor' ? 'IoT' : 'סלולר'}
                  </span>
                  {pin.speed !== undefined && pin.speed > 0 && (
                    <span className="text-[10px] font-mono font-medium text-[#2C6E49] block">
                      {pin.speed.toFixed(1)} קמ"ש
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filteredPins.length === 0 && (
              <p className="text-xs text-[#646464] italic text-center py-8">אין אותות תואמים זמינים בשטח כעת.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}