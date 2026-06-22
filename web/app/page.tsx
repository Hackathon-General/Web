"use client";

import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

export default function Home() {
  const { user, login, logout, loading } = useAuth();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-emerald-400 font-mono">
        טוען מערכת...
      </div>
    );
  }

  // מסך כניסה מאובטח במידה ואין משתמש מחובר
  if (!user) {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      login(name, role);
    };

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-emerald-400 tracking-tight">שביל כרמל-כנרת</h1>
            <p className="text-slate-400 text-sm">מערכת קהילה וניהול מרכזית</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">שם משתמש או כינוי</label>
              <input
                type="text"
                placeholder="הכנס שם משתמש..."
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">סוג הרשאה במערכת</label>
              <select
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
              >
                <option value="user">📱 פורטל מטיילים וקהילה</option>
                <option value="admin">💻 מרכז בקרה ושליטה (חמ"ל)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold p-3 rounded-xl transition duration-200 text-sm shadow-lg shadow-emerald-500/10"
            >
              התחברות למערכת
            </button>
          </form>
        </div>
      </main>
    );
  }

  // תצוגת האפליקציה המלאה לאחר זיהוי ההרשאה
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      {/* סרגל ניווט עליון קבוע למוצר */}
      <header className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black text-emerald-400 tracking-wide">כרמל-כנרת</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold tracking-wide ${
            user.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          }`}>
            {user.role === 'admin' ? 'מערכת ניהול (Admin)' : 'פורטל קהילה'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">משתמש מחובר: <strong className="text-white font-medium">{user.name}</strong></span>
          <button 
            onClick={logout}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition"
          >
            נתק מערכת
          </button>
        </div>
      </header>

      {/* הזרמת הקומפוננטה המלאה לפי ה-Role של המשתמש */}
      <div className="flex-1 px-6 pb-6">
        {user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
      </div>
    </main>
  );
}