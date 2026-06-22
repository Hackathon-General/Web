"use client";

import React, { useState } from 'react';

export default function UserDashboard() {
  // נתונים מדומים זמניים (Mock Data) שיוחלפו בהמשך ב-Firebase
  const leaderboard = [
    { name: "מיכל ונועה (אם ובת)", distance: 42, location: "מקטע המוחרקה" },
    { name: "רוני לוי", distance: 35, location: "נחל קישון" },
    { name: "משפחת אברהם", distance: 28, location: "קרן כרמל" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* עמודה מרכזית: מפת מירוץ הלפיד ופיד חוויות */}
      <div className="lg:col-span-2 space-y-6">
        {/* כרטיס מירוץ הלפיד */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">🔥 מירוץ הלפיד הווירטואלי</h3>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/20">זמן אמת</span>
          </div>
          
          {/* פלסבו למפה - כאן תוטמע מפת ה-Leaflet הציבורית */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl h-80 flex flex-col items-center justify-center text-slate-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
            <span className="text-3xl mb-2">🗺️</span>
            <p className="text-sm font-medium text-slate-400">מפת התקדמות הלפיד על פני שביל כרמל-כנרת</p>
            <p className="text-xs text-slate-600 mt-1">רכיב המפה הציבורי יציג את מיקום הלפיד הדינמי</p>
          </div>

          {/* מונים חיים קהילתיים */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">השלמות שביל במצטבר</span>
              <span className="text-2xl font-black text-emerald-400">14</span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">קילומטרים שנצברו</span>
              <span className="text-2xl font-black text-emerald-400">1,240</span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">מטיילים פעילים כעת</span>
              <span className="text-2xl font-black text-emerald-400">32</span>
            </div>
          </div>
        </div>

        {/* פיד חוויות ותמונות מהשטח */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">📸 רגעים מן השביל</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* כרטיס חוויה דמו */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="h-48 bg-slate-800 flex items-center justify-center text-slate-600">גלריית תמונות מהשטח</div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="font-bold text-slate-200">דנה ותמי (אם ובת)</span>
                  <span>לפני 12 דק׳</span>
                </div>
                <p className="text-sm text-slate-300">סיימנו עכשיו את משימת "קשר עין" בתצפית המוחרקה. חוויה מדהימה ומקרבת!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* עמודה צידית: Leaderboard ואזור סיום טיול */}
      <div className="space-y-6">
        {/* טבלת מובילים נושאי הלפיד */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">🏆 מובילי נושאי הלפיד</h3>
          <div className="space-y-3">
            {leaderboard.map((leader, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-4">#{i+1}</span>
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">{leader.name}</h4>
                    <p className="text-[11px] text-slate-500">{leader.location}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-400">{leader.distance} ק״מ</span>
              </div>
            ))}
          </div>
        </div>

        {/* אזור אישי: סיכום וסיום טיול לבית */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">🏡 המשכיות ועשייה בבית</h3>
            <p className="text-xs text-slate-400 mt-1">קבלת משימות המשך מותאמות אישית לפי התחנות בהן ביקרת בשביל</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-3">
            <p className="text-sm text-slate-300">בסיום ההליכה בשטח, הזן את סיכום המסלול שלך לקבלת מסרי ההמשך והשראה לבית.</p>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium p-2.5 rounded-lg text-xs border border-slate-700 transition">
              לסנכרון סיום מסלול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}