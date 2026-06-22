"use client";

import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("ההתחברות נכשלה. ודא שחשבון הגוגל שלך מורשה גישה.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FEF6ED] p-4 font-sans text-right" direction="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#F0F0F0] p-8 shadow-xl text-center">
        <div className="mb-6">
          <span className="text-3xl">🔥</span>
          <h1 className="text-2xl font-black text-[#2A3C2C] mt-2">חמ"ל שביל כרמל־כנרת</h1>
          <p className="text-xs text-[#646464] mt-1">כניסה למערכת השליטה והבקרה המרכזית</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-[#2C6E49] hover:bg-[#2A3C2C] text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
        >
          {loading ? (
            <span>מתחבר...</span>
          ) : (
            <>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.743-.08-1.313-.175-1.876H12.24z"/>
              </svg>
              <span>התחברות באמצעות Google</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-[#646464] mt-6 leading-relaxed">
          המערכת מאובטחת ומיועדת למארגני ומנהלי מרוץ השליחים בלבד. האזנת קצה מנוטרת.
        </p>
      </div>
    </div>
  );
}