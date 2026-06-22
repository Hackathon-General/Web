"use client";

import React, { useState } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'map' | 'nfr' | 'messages'>('map');
  
  // שדות טופס NFR מוכנים ל-Firebase Push
  const [stationName, setStationName] = useState('');
  const [lat, setLat] = useState('32.6743');
  const [lng, setLng] = useState('35.0841');
  const [contentValue, setContentValue] = useState('');

  // נתוני ניטור מדומים עבור רצים פעילים בשטח
  const activeRunners = [
    { id: "runner_101", name: "קבוצת איתן", speed: "11.2 קמ\"ש", battery: "84%", lastSeen: "לפני דקה" },
    { id: "runner_102", name: "רוני כהן (נציג קהילה)", speed: "9.5 קמ\"ש", battery: "92%", lastSeen: "לפני 3 דק׳" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      
      {/* תפריט שליטה צדדי */}
      <div className="w-full lg:w-1/4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white border-r-4 border-amber-500 pr-2">חמ"ל כרמל כנרת</h3>
            <p className="text-[11px] text-slate-400 mt-1">מערכת בקרה וניהול גיאוגרפית רשמית</p>
          </div>

          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('map')}
              className={`w-full text-right p-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${activeTab === 'map' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10' : 'bg-slate-950 hover:bg-slate-800 text-slate-300'}`}
            >
              <span>🛰️ מסך בקרה וניטור חי</span>
              {activeTab === 'map' && <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('nfr')}
              className={`w-full text-right p-3 rounded-xl text-xs font-bold transition ${activeTab === 'nfr' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10' : 'bg-slate-950 hover:bg-slate-800 text-slate-300'}`}
            >
              <span>📍 ניהול נקודות ציון ומשימות (NFR)</span>
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`w-full text-right p-3 rounded-xl text-xs font-bold transition ${activeTab === 'messages' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10' : 'bg-slate-950 hover:bg-slate-800 text-slate-300'}`}
            >
              <span>📋 הגדרת מסרי המשכיות לבית</span>
            </button>
          </nav>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex justify-between items-center mt-4">
          <span>סנכרון ליבה (DB):</span>
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> תקין
          </span>
        </div>
      </div>

      {/* לוח עבודה דינמי */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-y-auto shadow-xl">
        
        {/* טאב 1: מסך ניטור חי ומפת שליטה */}
        {activeTab === 'map' && (
          <div className="h-full flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h4 className="text-lg font-bold text-white">מפת ניטור אולטרה-מרתון בזמן אמת</h4>
                <p className="text-xs text-slate-400">הצלבת נתוני מיקום המגיעים מאפליקציות הרצים ומערכות הקצה</p>
              </div>
              <span className="text-[11px] font-mono text-amber-500 bg-amber-500/5 px-2.5 py-1 rounded-md border border-amber-500/10">Live Tracker</span>
            </div>

            {/* סימולטור מפה אינטראקטיבית */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 min-h-[300px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#d68c45_0.5px,transparent_0.5px)] [background-size:24px Play_24px] opacity-10"></div>
              <span className="text-3xl mb-2">🛰️</span>
              <p className="text-xs font-bold text-slate-400">תצוגת רשת קואורדינטות של שביל כרמל כנרת</p>
              <p className="text-[10px] text-slate-600 mt-1">רכיב המפה המלא (Leaflet) יוטמע כאן ויציג רצים ונקודות עניין בלייב</p>
            </div>

            {/* טבלת מעקב רצים אקטיביים */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">רצים ומנשיאי לפיד פעילים כעת:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeRunners.map((runner) => (
                  <div key={runner.id} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex justify-between items-center">
                    <div className="space-y-1">
                      <h6 className="text-sm font-bold text-white">{runner.name}</h6>
                      <p className="text-[11px] text-slate-500">מזהה מכשיר: {runner.id} • עודכן {runner.lastSeen}</p>
                    </div>
                    <div className="text-left space-y-1">
                      <span className="text-xs font-bold text-amber-400 block">{runner.speed}</span>
                      <span className="text-[10px] text-slate-400 block">🔋 סוללה: {runner.battery}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* טאב 2: הגדרת משימות ונקודות עניין (NFR) */}
        {activeTab === 'nfr' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold text-white">הזנת נקודת ציון ומשימה בשטח (NFR)</h4>
              <p className="text-xs text-slate-400 mt-1">יצירת נקודת תוכן חדשה על גבי תוואי השביל שתשמר ישירות ב-Firebase Database</p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="bg-slate-950 p-6 rounded-xl border border-slate-800 max-w-xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">קו רוחב (Latitude)</label>
                  <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">קו אורך (Longitude)</label>
                  <input type="text" value={lng} onChange={(e) => setLng(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono" />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">שם הנקודה / התחנה בשביל</label>
                <input type="text" value={stationName} onChange={(e) => setStationName(e.target.value)} placeholder="לדוגמה: תצפית המוחרקה, נחל קישון" className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">תוכן המשימה / מדריך ערכים דיגיטלי</label>
                <textarea rows={3} value={contentValue} onChange={(e) => setContentValue(e.target.value)} placeholder="כתוב את שאלת השיח או המשימה הקהילתית עבור המטיילים המגיעים לרדיוס התחנה..." className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none" />
              </div>

              <button type="button" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black p-3 rounded-lg text-xs transition uppercase tracking-wide">
                שמור והפץ נקודה למערכת המרכזית 🚀
              </button>
            </form>
          </div>
        )}

        {/* טאב 3: חוקיות מסרי המשכיות לבית */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-bold text-white">ניהול מסרי המשכיות ועשייה בבית</h4>
              <p className="text-xs text-slate-400 mt-1">קישור משימות ההתנדבות וההשראה הקהילתיות לתחנות השביל השונות</p>
            </div>
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 max-w-xl text-center space-y-2">
              <p className="text-xs text-slate-400">כאן נגדיר את השדות שישמרו בתוך האוסף `take_home_messages` ב-Cloud Firestore.</p>
              <p className="text-[11px] text-slate-600 font-mono">הטבלאות והקישורים מוכנים לקריאת נתוני ה-Firebase לכשתסופק.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}