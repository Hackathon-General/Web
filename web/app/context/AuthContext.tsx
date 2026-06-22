"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// הגדרת מבנה הנתונים של משתמש רשום במערכת
interface User {
  name: string;
  role: 'user' | 'admin';
}

// הגדרת הטיפוסים עבור ה-Context
interface AuthContextType {
  user: User | null;
  login: (name: string, role: 'user' | 'admin') => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // טעינת מצב סשן קיים מתוך ה-LocalStorage בעת עמידת האפליקציה
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('carmel_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to load user session:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // פונקציית התחברות קבועה למערכת
  const login = (name: string, role: 'user' | 'admin') => {
    const newUser: User = { name, role };
    setUser(newUser);
    localStorage.setItem('carmel_user', JSON.stringify(newUser));
  };

  // פונקציית התנתקות וניקוי סשן
  const logout = () => {
    setUser(null);
    localStorage.removeItem('carmel_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook מותאם אישית לשימוש מהיר ברחבי האפליקציה
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}