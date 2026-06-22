"use client";

import React, { useState } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'map' | 'nfr' | 'actions'>('map');

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
      
      {/* סרגל ניהול ייעודי פנימי */}
      <div className="w-full lg:w-1/4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">ממשק ניהול מערכת</h3>
            <p className="text-xs text-slate-400">ניהול, ניטור ועדכון השביל בזמן אמת</p>
          </div>

          {/* כפתורי ניווט פנימיים לחמ"ל */}
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('map')}
              className={`w-full text-right p-3 rounded-xl text-sm font-medium transition ${activeTab === 'map' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-950 hover:bg-slate-800 text-slate-300'}`}
            >
              🛰️ מפת שליטה חיה (Command Center)
            </button>
            <button 
              onClick={() => setActiveTab('nfr')}
              className={`w-full text-right p-3 rounded-xl text-sm font-medium transition ${activeTab === 'nfr' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-950 hover:bg-slate-800 text-slate-300'}`}
            >
              📍 הגדרת מדריך ומשימות (NFRs)
            </button>
            <button 
              onClick={() => setActiveTab('actions')}
              className={`w-full text-right p-3 rounded-xl text-sm font-medium transition ${activeTab === 'actions' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-950 hover:bg-slate-800 text-slate-300'}`}
            >
              📋 ניהול משימות המשך לבית
            </button>
          </nav>
        </div>

        {/* סטטוס מערכת בריא */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60 text-xs text-slate-400 flex justify-between items-center mt-4">
          <span>סטטוס חיבור שרת:</span>
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> מחובר
          </span>
        </div>
      </div>

      {/* תצוגת אזור עבודה דינמי לפי הטאב הנבחר */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-y-auto">
        
        {activeTab === 'map' && (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-bold text-white">מפת מסך מלא - ניטור אולטרה-מרתון ורצים</h4>
              <p className="text-xs text-slate-400 font-mono">📡 קולט נתוני IoT ואפליקציה במקביל</p>
            </div>
            {/* פלסבו למפת אדמין - כאן תוטמע מפת ה-Leaflet האינטראקטיבית לאדמינים */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 min-h-[400px] relative">
              <span className="text-4xl mb-2">📡</span>
              <p className="text-sm font-medium text-slate-400">תצוגת סיכות דינמיות בזמן אמת (God Mode)</p>
              <p className="text-xs text-slate-600 mt-1">כאן יוצגו המטיילים ורצי השליחים עם מהירויות וזמנים</p>
            </div>
          </div>
        )}

        {activeTab === 'nfr' && (
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white">הגדרת מדריך הטיולים ומשימות גיאוגרפיות</h4>
            <p className="text-sm text-slate-400">הזן נקודות עניין חדשות על גבי המסלול, קבע את סוג המשימה (שיח ערכים, משחק שטח) והגדר רדיוס התראה (Geofence).</p>
            
            {/* פורמולה נקייה להזנת נתונים */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 max-w-xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">קו רוחב (Latitude)</label>
                  <input type="text" disabled placeholder="יוזן בדקירה על המפה" className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">קו אורך (Longitude)</label>
                  <input type="text" disabled placeholder="יוזן בדקירה על המפה" className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">שם הנקודה / התחנה</label>
                <input type="text" placeholder="לדוגמה: חניון האגם" className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold p-2.5 rounded-lg text-sm transition">
                שמור נקודה במערכת
              </button>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white">מערכת התאמת חוקיות משימות המשך</h4>
            <p className="text-sm text-slate-400">חיבור חכם בין נקודת עניין על השביל לבין מסר עשייה/התנדבות שהמטייל יקבל לחשבונו בסוף היום.</p>
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 max-w-xl">
              <p className="text-xs text-slate-500 italic">רכיב הטפסים והקישורים ל-take_home_messages יוטמע כאן בהמשך החיבור ל-DB.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}