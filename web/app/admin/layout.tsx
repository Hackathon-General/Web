"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";

const navItems = [
  { href: "/admin", label: "לוח בקרה", icon: "📊" },
  { href: "/admin/live", label: "מפה חיה", icon: "🗺️" },
  { href: "/admin/missions", label: "משימות NFR", icon: "📋" },
  { href: "/admin/alerts", label: "התראות", icon: "🚨" },
  { href: "/admin/leaderboard", label: "טבלת מובילים", icon: "🏆" },
  { href: "/admin/feed", label: "פיד קהילתי", icon: "📰" },
  { href: "/admin/users", label: "משתמשים", icon: "👥" },
  { href: "/admin/stations", label: "תחנות", icon: "📍" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, initializing, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (initializing) return;
    if (!user) {
      router.replace("/login");
    } else if (role !== "admin") {
      router.replace("/login");
    }
  }, [user, role, initializing, router]);

  if (initializing) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  }

  if (!user || role !== "admin") {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>שביל כרמל-כנרת</h1>
          <p>חמ״ל — God Mode</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? "Admin"}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--c-terracotta)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.875rem",
                }}
              >
                {(user.displayName ?? user.email ?? "A")[0]}
              </div>
            )}
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user.displayName ?? "מנהל"}
              </div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
          </div>
          <button className="btn-signout" onClick={signOut}>
            🚪 התנתק
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </>
  );
}
