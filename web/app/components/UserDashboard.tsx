"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// טעינה דינמית של קומפוננטת המפה האמיתית למניעת שגיאות SSR (צד שרת)
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400">
      🛰️ טוען רשת לוויין ומפה חיה...
    </div>
  ),
});

// נתוני מקטעים רשמיים מבוססי אתר כרמל-כנרת
const trailSegments = [
  { id: 1, name: "רכס הכרמל והמוחרקה", status: "completed", hiker: "משפחת אלון", values: "חיבור ואהבת הארץ" },
  { id: 2, name: "עמק יזרעאל ויישובי העמק", status: "active", hiker: "קבוצת צוערי תקשוב", values: "מנהיגות ועבודת צוות" },
  { id: 3, name: "רמת פוריה ומורדות הכנרת", status: "pending", hiker: "-", values: "התמדה ונחישות" },
];

const mockFeed = [
  {
    id: 1,
    author: "צוות איתן",
    segment: "מקטע 2 - יישובי העמק",
    text: "נשאנו את הלפיד היום דרך השדות של העמק. חוויה מדהימה של חיבור לאדמה ולאנשים לאורך הדרך.",
    time: "לפני שעה"
  },
  {
    id: 2,
    author: "משפחת אלון",
    segment: "מקטע 1 - רכס הכרמל",
    text: "סיימנו את המשימה הקהילתית במוחרקה! הילדים למדו על ההיסטוריה המקומית וקיבלנו השראה רבה.",
    time: "לפני 4 שעות"
  }
];

export default function UserDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'torch'>('overview');

  // מערך לפידים פעילים בשטח כולל סטטוס תנועה (isMoving)
  const [activeTorches, setActiveTorches] = useState([
    { id: "torch_1", holder: "קבוצת צוערי תקשוב", coords: "32.6743, 35.0841", description: "חניון האגם - כרמל", lastUpdated: "היום, 15:30", isMoving: false },
    { id: "torch_2", holder: "משפחת אלון", coords: "32.6210, 35.1234", description: "תצפית המוחרקה", lastUpdated: "היום, 14:15", isMoving: false },
    { id: "torch_3", holder: "צוות איתן (רצי שטח)", coords: "32.5567, 35.2456", description: "כניסה לעמק יזרעאל", lastUpdated: "היום, 16:05", isMoving: true }
  ]);

  // סטייט ללפיד הנבחר לצורך הצגה במפה
  const [selectedTorchId, setSelectedTorchId] = useState("torch_1");

  // ניהול סוג הפעולה בטופס הצידי: 'take' (איסוף שליחים), 'update' (נעיצה/עדכון), או 'create' (הזנקה חדשה)
  const [actionType, setActionType] = useState<'take' | 'update' | 'create'>('take');

  // שדות הטופס
  const [targetTorchId, setTargetTorchId] = useState("torch_1");
  const [newTorchName, setNewTorchName] = useState('');
  const [newCoords, setNewCoords] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // חישוב מרחק אווירי במטרים (Haversine Formula) לצורך Geofence של איסוף הלפיד
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // רדיוס כדור הארץ בקילומטרים
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // מרחק במטרים
  };

  // שליפת מיקום מה-GPS של המכשיר
  const handleGetLocation = (callback?: (coordsStr: string) => void) => {
    if (!navigator.geolocation) {
      alert("הדפדפן שלך אינו תומך בזיהוי מיקום גיאוגרפי.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        const coordsStr = `${latitude}, ${longitude}`;
        setNewCoords(coordsStr);
        setIsLocating(false);
        if (callback) callback(coordsStr);
      },
      (error) => {
        setIsLocating(false);
        alert("אירעה שגיאה בקבלת מיקום מה-GPS. ודא שהרשאות המיקום פעילות במכשיר.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // פונקציית איסוף לפיד (מירוץ שליחים מבוסס מרחק GPS)
  const handleTakeTorchDirectly = (torchId: string) => {
    handleGetLocation((userCoordsStr) => {
      const targetTorch = activeTorches.find(t => t.id === torchId);
      if (!targetTorch) return;

      const [tLat, tLng] = targetTorch.coords.split(',').map(Number);
      const [uLat, uLng] = userCoordsStr.split(',').map(Number);

      const distanceInMeters = calculateDistance(tLat, tLng, uLat, uLng);

      // חסימת איסוף מרחוק: המטייל חייב להיות ברדיוס של עד 250 מטרים מנקודת הנעיצה של הלפיד
      if (distanceInMeters > 250) {
        alert(`❌ מרחק רב מדי! אתה נמצא כ-${Math.round(distanceInMeters)} מטרים ממיקום הלפיד. עליך להגיע פיזית לנקודת המפגש של הלפיד בשביל על מנת לאסוף אותו ולהמשיך את המירוץ.`);
        return;
      }

      setActiveTorches(prev => prev.map(t => t.id === torchId 
        ? { ...t, holder: "אתה (המשך שליחים)", isMoving: true, lastUpdated: "עכשיו (נאסף על ידך)" } 
        : t
      ));
      alert(`🔥 הלפיד אצלך! המקל עבר אליך בהצלחה. צא לדרך ונווט לאורך השביל, ובסיום המקטע אל תשכח לנעוץ אותו מחדש לקבוצות הבאות.`);
    });
  };

  // ניהול שליחת הטופס לנעיצה או הזנקה
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoords || !newDesc) return;

    if (actionType === 'update') {
      setActiveTorches(prevTorches => 
        prevTorches.map(t => t.id === targetTorchId 
          ? { ...t, coords: newCoords, description: newDesc, holder: "משתמש נוכחי (אתה)", isMoving: false, lastUpdated: "עכשיו (נעוץ וממתין)" }
          : t
        )
      );
      alert("📌 המיקום עודכן בהצלחה! הלפיד ננעץ בנקודה החדשה וממתין לרץ הבא בתור בשטח.");
    } else if (actionType === 'create') {
      const nameToSave = newTorchName.trim() || "לפיד קהילתי חדש";
      const newId = `torch_${Date.now()}`;
      const newTorchItem = {
        id: newId,
        holder: nameToSave,
        coords: newCoords,
        description: newDesc,
        lastUpdated: "עכשיו (הזנקה)",
        isMoving: true
      };
      setActiveTorches(prevTorches => [...prevTorches, newTorchItem]);
      setSelectedTorchId(newId);
      setNewTorchName('');
      alert(`✨ לפיד שליחים חדש הושק והוזנק בהצלחה בנתיב!`);
    }
    setNewCoords('');
    setNewDesc('');
  };

  const currentSelectedTorch = activeTorches.find(t => t.id === selectedTorchId) || activeTorches[0];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* סרגל ניווט פנימי (טאבים) */}
      <div className="flex border-b border-slate-800 gap-2 pb-px">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${activeSubTab === 'overview' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          📊 מבט על ופיד קהילה
        </button>
        <button
          onClick={() => setActiveSubTab('torch')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${activeSubTab === 'torch' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          🔥 לפידים פעילים בשטח
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">{activeTorches.length}</span>
        </button>
      </div>

      {/* טאב 1: מבט על וסטטוס מקטעים כללי */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-amber-500 mb-6">🔥 התקדמות מירוץ הלפיד הרשמי</h3>
              <div className="relative border-r-2 border-slate-800 mr-4 space-y-6 flex flex-col">
                {trailSegments.map((segment) => (
                  <div key={segment.id} className="relative pr-6">
                    <span className={`absolute -right-[7px] top-1 w-3 h-3 rounded-full border-2 ${segment.status === 'completed' ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/50' : segment.status === 'active' ? 'bg-amber-500 border-amber-500 animate-pulse shadow-lg shadow-amber-500/50' : 'bg-slate-900 border-slate-700'}`} />
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{segment.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">ערך מוביל: <span className="text-amber-500/90">{segment.values}</span></p>
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-md font-medium tracking-wide ${segment.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : segment.status === 'active' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-500'}`}>
                        {segment.status === 'completed' ? `הושלם ע"י ${segment.hiker}` : segment.status === 'active' ? `בתנועה: ${segment.hiker}` : 'ממתין להזנקה'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">📸 קולות מן המסלול</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockFeed.map((post) => (
                  <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-lg">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-bold text-amber-400">{post.author}</span>
                      <span className="text-slate-500">{post.time}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{post.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 relative overflow-hidden shadow-xl">
              <h3 className="text-lg font-bold text-white">🌿 ערכי עמותת כרמל כנרת</h3>
              <p className="text-xs text-slate-300 leading-relaxed">הכרת נופי המולדת דרך הרגליים, פיתוח אחריות סביבתית ושמירה על נכסי הטבע הלאומיים של שביל כרמל-כנרת.</p>
            </div>
          </div>
        </div>
      )}

      {/* טאב 2: מערכת השליחים, ריבוי הלפידים והמפה האינטראקטיבית האמיתית */}
      {activeSubTab === 'torch' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* רשימת כרטיסי הלפידים הפעילים בשטח */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeTorches.map((torch) => (
                <button
                  key={torch.id}
                  onClick={() => setSelectedTorchId(torch.id)}
                  className={`p-4 rounded-xl border text-right transition flex flex-col justify-between h-28 shadow-sm ${
                    selectedTorchId === torch.id
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${torch.isMoving ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {torch.isMoving ? "🏃 בתנועה" : "📌 ממתין לאיסוף"}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{torch.id}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{torch.holder}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">📍 {torch.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* כרטיס תצוגת המפה האינטראקטיבית המלאה של הלפיד הנבחר */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800/60 pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{currentSelectedTorch.holder}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${currentSelectedTorch.isMoving ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {currentSelectedTorch.isMoving ? "המקטע מבוצע כעת בשטח" : "נעוץ וממתין לרץ הבא בתור"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">נקודה מוצהרת: <span className="text-slate-200 font-medium">{currentSelectedTorch.description}</span></p>
                </div>
                
                {/* אפשרות לאיסוף ישיר מתוך חלונית המפה */}
                {!currentSelectedTorch.isMoving && (
                  <button
                    type="button"
                    onClick={() => handleTakeTorchDirectly(currentSelectedTorch.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow-md whitespace-nowrap"
                  >
                    🏃 לחץ כאן לאיסוף הלפיד בשטח
                  </button>
                )}
              </div>

              {/* הזרקת קומפוננטת המפה האמיתית (Leaflet) */}
              <div className="h-80 w-full rounded-xl overflow-hidden relative border border-slate-800 shadow-inner">
                <MapComponent torches={activeTorches} selectedTorchId={selectedTorchId} />
              </div>
            </div>
          </div>

          {/* עמודה צידית: מרכז ניהול הפעולות הדינמי */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">📌 מרכז פעולות לפיד</h3>
                <p className="text-xs text-slate-400 mt-1">נהל את סבב השליחים: קבל לפיד שהמתין בשטח, עדכן את מקומך או הזנק לפיד קהילתי חדש</p>
              </div>

              {/* סלקטור לבחירת סוג הפעולה בטופס */}
              <div className="grid grid-cols-3 p-1 bg-slate-950 rounded-xl border border-slate-800/60 text-[10px] font-bold">
                <button type="button" onClick={() => setActionType('take')} className={`py-2 rounded-lg transition ${actionType === 'take' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}>
                  🏃 איסוף לפיד
                </button>
                <button type="button" onClick={() => setActionType('update')} className={`py-2 rounded-lg transition ${actionType === 'update' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}>
                  📌 נעיצה/עדכון
                </button>
                <button type="button" onClick={() => setActionType('create')} className={`py-2 rounded-lg transition ${actionType === 'create' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}>
                  ✨ הזנקה חדשה
                </button>
              </div>

              {/* אופציה 1: רשימת לפידים זמינים לאיסוף שליחים קרוב (GPS) */}
              {actionType === 'take' && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-slate-400 leading-relaxed">נמצא פיזית בנקודת המפגש שבה הושאר הלפיד בשטח? לחץ על הכפתור כדי לקחת עליו בעלות ולהמשיך את הריצה.</p>
                  <div className="space-y-2">
                    {activeTorches.filter(t => !t.isMoving).map(torch => (
                      <div key={torch.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center gap-2">
                        <div>
                          <span className="text-sm font-bold text-white block">{torch.holder}</span>
                          <span className="text-[11px] text-slate-500 block">📍 {torch.description}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTakeTorchDirectly(torch.id)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap"
                        >
                          איסוף 🏃
                        </button>
                      </div>
                    ))}
                    {activeTorches.filter(t => !t.isMoving).length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-2 italic">כל הלפידים נמצאים כרגע בתנועה בשטח.</p>
                    )}
                  </div>
                </div>
              )}

              {/* אופציה 2 ו-3: טפסי נעיצה / הזנקה ידנית או אוטומטית */}
              {actionType !== 'take' && (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {actionType === 'update' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">בחר לפיד לנעיצה וסיום מקטע</label>
                      <select value={targetTorchId} onChange={(e) => setTargetTorchId(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium">
                        {activeTorches.map(t => (
                          <option key={t.id} value={t.id}>🔥 {t.holder} ({t.id})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">שם הלפיד / הקבוצה המזניקה</label>
                      <input type="text" value={newTorchName} onChange={(e) => setNewTorchName(e.target.value)} placeholder="לדוגמה: צוות שומריה, משפחת רון" className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500" required />
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-slate-400">קואורדינטות מיקום</label>
                      <button type="button" onClick={() => handleGetLocation()} disabled={isLocating} className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/20 disabled:opacity-50">
                        {isLocating ? "🛰️ מאתר..." : "🎯 דקור מיקום נוכחי"}
                      </button>
                    </div>
                    <input type="text" value={newCoords} onChange={(e) => setNewCoords(e.target.value)} placeholder="קו רוחב, קו אורך" className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono" required />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">תיאור המקום או סימן זיהוי בשטח</label>
                    <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="לדוגמה: ליד האנטנה הגבוהה במוחרקה" className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500" required />
                  </div>

                  <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black p-3 rounded-xl text-xs transition shadow-lg">
                    {actionType === 'update' ? "נעל מקטע ונעץ לפיד בשטח 📌" : "הזנק לפיד שליחים חדש ✨"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}