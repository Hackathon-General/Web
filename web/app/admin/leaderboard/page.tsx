"use client";

import { useLeaderboard } from "@/lib/hooks/useLeaderboard";

export default function LeaderboardPage() {
  const { rows, communityKm } = useLeaderboard(50);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🏆 טבלת מובילים</h1>
        <p className="page-subtitle">
          דירוג המטיילים לפי קילומטרים שנצברו
        </p>
      </div>

      {/* Community km bank */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, var(--c-deep-green), var(--c-deep-green-dark))",
          textAlign: "center",
          marginBottom: "var(--sp-xl)",
          border: "none",
        }}
      >
        <div
          style={{
            fontSize: "3.5rem",
            fontWeight: 900,
            color: "var(--c-gold)",
            lineHeight: 1,
          }}
        >
          {communityKm.toFixed(1)}
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "0.9375rem",
            marginTop: "var(--sp-xs)",
          }}
        >
          בנק הקילומטרים הקהילתי
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {rows.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🏆</div>
            <div className="title">אין נתונים עדיין</div>
            <div className="desc">
              נתוני מטיילים יופיעו כאן כשמטיילים ישתמשו באפליקציה
            </div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>משתמש</th>
                <th>אימייל</th>
                <th style={{ width: 100 }}>ק״מ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className="animate-slide-in" style={{ animationDelay: `${i * 0.03}s` }}>
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        fontWeight: 900,
                        fontSize: "0.8125rem",
                        background:
                          i === 0
                            ? "var(--c-gold)"
                            : i === 1
                              ? "#C0C0C0"
                              : i === 2
                                ? "#CD7F32"
                                : "var(--c-line)",
                        color:
                          i < 3 ? "#fff" : "var(--c-muted)",
                      }}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {row.photoURL ? (
                        <img
                          src={row.photoURL}
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
                        {row.displayName ?? "מטייל/ת"}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: "var(--c-muted)", fontSize: "0.8125rem" }}>
                    {row.email ?? "—"}
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 800,
                        color: "var(--c-forest)",
                        fontSize: "0.9375rem",
                      }}
                    >
                      {(row.totalKm ?? 0).toFixed(1)}
                    </span>
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
