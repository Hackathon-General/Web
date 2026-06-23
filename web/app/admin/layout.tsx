"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";
import {
  LuLayoutDashboard,
  LuMap,
  LuClipboardList,
  LuSiren,
  LuTrophy,
  LuNewspaper,
  LuUsers,
  LuMapPin,
  LuBookOpen,
  LuLogOut,
} from "react-icons/lu";

const navItems = [
  { href: "/admin", label: "לוח בקרה", icon: <LuLayoutDashboard size={18} /> },
  { href: "/admin/live", label: "מפה חיה", icon: <LuMap size={18} /> },
  { href: "/admin/missions", label: "משימות NFR", icon: <LuClipboardList size={18} /> },
  { href: "/admin/alerts", label: "התראות", icon: <LuSiren size={18} /> },
  { href: "/admin/leaderboard", label: "טבלת מובילים", icon: <LuTrophy size={18} /> },
  { href: "/admin/feed", label: "פיד קהילתי", icon: <LuNewspaper size={18} /> },
  { href: "/admin/users", label: "משתמשים", icon: <LuUsers size={18} /> },
  { href: "/admin/stations", label: "תחנות", icon: <LuMapPin size={18} /> },
  { href: "/admin/docs", label: "מדריך פיתוח", icon: <LuBookOpen size={18} /> },
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
    }
  }, [user, initializing, router]);

  if (initializing) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
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
          <p>{role === "admin" ? "חמ״ל — God Mode" : "חמ״ל — צפייה בלבד"}</p>
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
                alt={user.displayName ?? "User"}
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
                {user.displayName ?? "משתמש"}
              </div>
              <div className="sidebar-user-email">
                {user.email} {role !== "admin" && <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>(צפייה בלבד)</span>}
              </div>
            </div>
          </div>
          <button
            className="btn-signout"
            onClick={signOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <LuLogOut size={16} />
            התנתק
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </>
  );
}
