"use client";

import { useState } from "react";
import { useUsers } from "@/lib/hooks/useUsers";

export default function UsersPage() {
  const { users, loading } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.displayName?.toLowerCase().includes(q)) ||
      (u.email?.toLowerCase().includes(q)) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  const admins = users.filter((u) => u.role === "admin").length;
  const anonymous = users.filter((u) => u.isAnonymous).length;

  const formatDate = (ts?: number) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("he-IL");
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">👥 ניהול משתמשים</h1>
        <p className="page-subtitle">
          סה״כ {users.length} משתמשים · {admins} מנהלים · {anonymous} אנונימיים
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: "var(--sp-lg)" }}>
        <div className="stat-card forest">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">סה״כ משתמשים</div>
        </div>
        <div className="stat-card terracotta">
          <div className="stat-icon">🔑</div>
          <div className="stat-value">{admins}</div>
          <div className="stat-label">מנהלים</div>
        </div>
        <div className="stat-card sky">
          <div className="stat-icon">👻</div>
          <div className="stat-value">{anonymous}</div>
          <div className="stat-label">אנונימיים</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <span className="icon">🔍</span>
        <input
          className="input"
          placeholder="חיפוש לפי שם / אימייל / UID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingRight: 40 }}
        />
      </div>

      {/* Users table */}
      <div className="card" style={{ padding: 0, overflow: "auto" }}>
        {loading ? (
          <div className="loading-page" style={{ minHeight: 200 }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">👥</div>
            <div className="title">
              {searchQuery ? "אין תוצאות" : "אין משתמשים עדיין"}
            </div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>משתמש</th>
                <th>אימייל</th>
                <th>תפקיד</th>
                <th>ספק</th>
                <th>תחנות</th>
                <th>ק״מ</th>
                <th>הצטרף</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt=""
                          referrerPolicy="no-referrer"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "var(--c-line)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            color: "var(--c-muted)",
                          }}
                        >
                          👤
                        </div>
                      )}
                      <span style={{ fontWeight: 600 }}>
                        {u.displayName ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--c-muted)",
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {u.email ?? "—"}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        u.role === "admin" ? "badge-admin" : "badge-user"
                      }`}
                    >
                      {u.role === "admin" ? "מנהל" : "משתמש"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${u.isAnonymous ? "badge-anon" : "badge-user"}`}
                    >
                      {u.isAnonymous
                        ? "אנונימי"
                        : u.provider === "google"
                          ? "Google"
                          : u.provider ?? "—"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--c-terracotta)" }}>
                    {u.stationsVisited?.length ?? 0}
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--c-forest)" }}>
                    {(u.totalKm ?? 0).toFixed(1)}
                  </td>
                  <td
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--c-muted)",
                    }}
                  >
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
