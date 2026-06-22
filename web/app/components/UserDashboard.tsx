"use client";

import React, { useState } from 'react';

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

  // מערך לפידים פעילים בשטח (יתחבר ל-Firebase בהמשך)
  const [activeTorches, setActiveTorches] = useState([
    { id: "torch_1", holder: "קבוצת צוערי תקשוב", coords: "32.6743, 35.0841", description: "חניון האגם - כרמל", lastUpdated: "היום, 15:30" },
    { id: "torch_2", holder: "משפחת אלון", coords: "32.6210, 35.1234", description: "תצפית המוחרקה", lastUpdated: "היום, 14:15" },
    { id: "torch_3", holder: "צוות איתן (רצי שטח)", coords: "32.5567, 35.2456", description: "כניסה לעמק יזרעאל", lastUpdated: "היום, 16:05" }
  ]);

  // סטייט ללפיד הנבחר לצורך הצגה במפה
  const [selectedTorchId, setSelectedTorchId] = useState("torch_1");

  // ניהול סוג הפעולה בטופס: 'update' (עדכון קיים) או 'create' (הזנקת לפיד חדש)
  const [actionType, setActionType] = useState<'update' | 'create'>('update');

  // שדות הטופס לנעיצה חדשה
  const [targetTorchId, setTargetTorchId] = useState("torch_1");
  const [newTorchName, setNewTorchName] = useState(''); // עבור לפיד חדש
  const [newCoords, setNewCoords] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // פונקציה לשליפת מיקום מה-GPS של המכשיר בשטח
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("הדפדפן שלך אינו תומך בזיהוי מיקום גיאוגרפי.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        setNewCoords(`${latitude}, ${longitude}`);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        alert("אירעה שגיאה בקבלת מיקום מה-GPS. ודא שהרשאות המיקום פעילות.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // פונקציה לניהול שליחת הטופס (עדכון או יצירת לפיד)
  const handlePinTorch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoords || !newDesc) return;

    if (actionType === 'update') {
      // עדכון לפיד קיים
      setActiveTorches(prevTorches => 
        prevTorches.map(t => t.id === targetTorchId 
          ? { ...t, coords: newCoords, description: newDesc, holder: "משתמש נוכחי (אתה)", lastUpdated: "עכשיו" }
          : t
        )
      );
    } else {
      // יצירת לפיד חדש לגמרי בשטח
      const nameToSave = newTorchName.trim() || "לפיד קהילתי חדש";
      const newId = `torch_${Date.now()}`;
      const newTorchItem = {
        id: newId,
        holder: nameToSave,
        coords: newCoords,
        description: newDesc,
        lastUpdated: "עכשיו (הזנקה)"
      };
      
      setActiveTorches(prevTorches => [...prevTorches, newTorchItem]);
      setSelectedTorchId(newId); // מעביר אוטומטית את המפה לצפייה בלפיד החדש
      setNewTorchName('');
    }
    
    setNewCoords('');
    setNewDesc('');
  };

  // מציאת הלפיד שנבחר לתצוגה במפה
  const currentSelectedTorch = activeTorches.find(t => t.id === selectedTorchId) || activeTorches[0];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* תפריט ניווט פנימי (טאבים) למטיילים */}
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

      {/* טאב 1: מבט על ופיד */}
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
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-amber-400">{post.author}</span>
                        <span className="text-slate-500">{post.time}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{post.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 relative overflow-hidden shadow-xl">
              <h3 className="text-lg font-bold text-white">🌿 ערכי עמותת כרמל כנרת</h3>
              <p className="text-xs text-slate-300">הכרת נופי המולדת דרך הרגליים, פיתוח אחריות סביבתית ושמירה על נכסי הטבע הלאומיים.</p>
            </div>
          </div>
        </div>
      )}

      {/* טאב 2: ריבוי לפידים והעברה / הזנקה בשטח */}
      {activeSubTab === 'torch' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* מפת הלפיד המרכזית ובחירת לפידים אקטיביים */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* רשימת כפתורי בחירה (Selector) בין הלפידים הפעילים */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeTorches.map((torch) => (
                <button
                  key={torch.id}
                  onClick={() => setSelectedTorchId(torch.id)}
                  className={`p-4 rounded-xl border text-right transition flex flex-col justify-between h-24 shadow-sm ${
                    selectedTorchId === torch.id
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-black text-amber-400">🔥 לפיד פעיל</span>
                    <span className="text-[9px] text-slate-500 font-mono">{torch.id}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{torch.holder}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">📍 {torch.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* כרטיס המפה והנתונים של הלפיד הנבחר מהרשימה */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800/60 pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white">מיקוד גיאוגרפי: {currentSelectedTorch.holder}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">מיקום נוכחי מוצהר: <span className="text-slate-200 font-medium">{currentSelectedTorch.description}</span></p>
                </div>
                <div className="text-right sm:text-left text-xs text-slate-500">
                  <span className="font-mono block">קואורדינטות: {currentSelectedTorch.coords}</span>
                  <span className="block mt-0.5">עדכון אחרון: {currentSelectedTorch.lastUpdated}</span>
                </div>
              </div>

              {/* סימולטור המפה */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl h-72 flex flex-col items-center justify-center text-slate-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#d68c45_0.5px,transparent_0.5px)] [background-size:20px_20px] opacity-10"></div>
                <span className="text-3xl mb-2 animate-bounce">🔥</span>
                <p className="text-sm font-bold text-slate-300">מפת מעקב – ממוקדת על לפיד ({currentSelectedTorch.id})</p>
              </div>
            </div>
          </div>

          {/* עמודה צידית: טופס דינמי לעדכון לפיד או הזנקת לפיד חדש */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">📌 ניהול לפידים בשטח</h3>
                <p className="text-xs text-slate-400 mt-1">עדכן נקודת לפיד קיים או דקור מיקום חדש כדי להזניק לפיד קהילתי נוסף</p>
              </div>

              {/* סלקטור לבחירת סוג הפעולה */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800/60 text-xs">
                <button
                  type="button"
                  onClick={() => setActionType('update')}
                  className={`py-2 rounded-lg font-bold transition ${actionType === 'update' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  🔄 עדכון לפיד קיים
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('create')}
                  className={`py-2 rounded-lg font-bold transition ${actionType === 'create' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  ✨ הזנקת לפיד חדש
                </button>
              </div>

              <form onSubmit={handlePinTorch} className="space-y-4">
                {actionType === 'update' ? (
                  /* שדה בחירת לפיד לעדכון */
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">בחר לפיד לעדכון</label>
                    <select 
                      value={targetTorchId}
                      onChange={(e) => setTargetTorchId(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                    >
                      {activeTorches.map(t => (
                        <option key={t.id} value={t.id}>🔥 {t.holder} ({t.id})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  /* שדה להזנת שם ללפיד חדש */
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">שם הלפיד / הקבוצה המזניקה</label>
                    <input 
                      type="text"
                      value={newTorchName}
                      onChange={(e) => setNewTorchName(e.target.value)}
                      placeholder="לדוגמה: קבוצת עומר, צוות 3" 
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>
                )}

                {/* קואורדינטות קצה עם ה-GPS */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-400">קואורדינטות מיקום</label>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1 bg-amber-500/5 hover:bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 disabled:opacity-50"
                    >
                      {isLocating ? "🛰️ מאתר מיקום..." : "🎯 דקור מיקום נוכחי"}
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={newCoords}
                    onChange={(e) => setNewCoords(e.target.value)}
                    placeholder="קו רוחב, קו אורך" 
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    required
                  />
                </div>
                
                {/* תיאור מיקום בשטח */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">תיאור המקום או סימן זיהוי בשטח</label>
                  <input 
                    type="text" 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="לדוגמה: ליד שלט חניון האגם" 
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black p-3 rounded-xl text-xs transition shadow-lg"
                >
                  {actionType === 'update' ? "עדכן מיקום לפיד נבחר 🚀" : "הזנק לפיד חדש לשטח ✨"}
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}