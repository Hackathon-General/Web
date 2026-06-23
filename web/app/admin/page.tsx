"use client";

import { useLive } from "@/lib/hooks/useLive";
import { useTorch } from "@/lib/hooks/useTorch";
import { useCommunityKm } from "@/lib/hooks/useCommunityKm";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { useFeed } from "@/lib/hooks/useFeed";
import { useUsers } from "@/lib/hooks/useUsers";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  LuSmartphone,
  LuRadio,
  LuFlame,
  LuActivity,
  LuSiren,
  LuClipboardList,
  LuTrophy,
  LuNewspaper,
  LuUser,
} from "react-icons/lu";

export default function AdminDashboard() {
  const pins = useLive();
  const { torch } = useTorch();
  const communityKm = useCommunityKm();
  const { rows: topUsers } = useLeaderboard(5);
  const { posts } = useFeed(10);
  const { users } = useUsers();
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [activeMissions, setActiveMissions] = useState(0);

  const phones = pins.filter((p) => p.source === "phone").length;
  const sensors = pins.filter((p) => p.source === "sensor").length;

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "alerts"), (snap) =>
      setActiveAlerts(snap.size)
    );
    const q2 = query(
      collection(db, "nfrs"),
      where("active", "==", true)
    );
    const unsub2 = onSnapshot(q2, (snap) => setActiveMissions(snap.size));
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">חמ״ל — לוח בקרה</h1>
        <p className="page-subtitle">
          סקירה כללית של פעילות השביל בזמן אמת
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="stats-grid">
        <div className="stat-card terracotta animate-fade-in stagger-1">
          <div className="stat-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LuSmartphone size={24} />
          </div>
          <div className="stat-value">{phones}</div>
          <div className="stat-label">מטיילים פעילים</div>
        </div>

        <div className="stat-card sky animate-fade-in stagger-2">
          <div className="stat-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LuRadio size={24} />
          </div>
          <div className="stat-value">{sensors}</div>
          <div className="stat-label">חיישנים מחוברים</div>
        </div>

        <div className="stat-card gold animate-fade-in stagger-3">
          <div className="stat-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LuFlame size={24} />
          </div>
          <div className="stat-value">
            {torch ? (torch.status === "held" ? "נישא" : "ממתין") : "—"}
          </div>
          <div className="stat-label">מצב הלפיד</div>
        </div>

        <div className="stat-card forest animate-fade-in stagger-4">
          <div className="stat-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LuActivity size={24} />
          </div>
          <div className="stat-value">{communityKm.toFixed(1)}</div>
          <div className="stat-label">ק״מ קהילתי</div>
        </div>

        <div className="stat-card danger animate-fade-in stagger-5">
          <div className="stat-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LuSiren size={24} />
          </div>
          <div className="stat-value">{activeAlerts}</div>
          <div className="stat-label">התראות פעילות</div>
        </div>

        <div className="stat-card mint animate-fade-in stagger-6">
          <div className="stat-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LuClipboardList size={24} />
          </div>
          <div className="stat-value">{activeMissions}</div>
          <div className="stat-label">משימות פעילות</div>
        </div>
      </div>

      {/* ── Quick panels ── */}
      <div className="two-col">
        {/* Top hikers */}
        <div className="card">
          <h3 style={{ margin: "0 0 var(--sp-md)", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <LuTrophy /> מובילים
          </h3>
          {topUsers.length === 0 ? (
            <p style={{ color: "var(--c-muted)", fontSize: "0.875rem" }}>
              אין נתונים עדיין
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>שם</th>
                  <th>ק״מ</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 900, color: "var(--c-terracotta)" }}>
                      {i + 1}
                    </td>
                    <td>{u.displayName ?? "מטייל/ת"}</td>
                    <td style={{ fontWeight: 700, color: "var(--c-forest)" }}>
                      {(u.totalKm ?? 0).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent feed */}
        <div className="card">
          <h3 style={{ margin: "0 0 var(--sp-md)", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <LuNewspaper /> פוסטים אחרונים
          </h3>
          {posts.length === 0 ? (
            <p style={{ color: "var(--c-muted)", fontSize: "0.875rem" }}>
              אין פוסטים עדיין
            </p>
          ) : (
            <div>
              {posts.slice(0, 5).map((p) => (
                <div key={p.id} className="feed-card" style={{ borderRadius: 0 }}>
                  <div className="feed-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {p.authorPhoto ? (
                      <img
                        src={p.authorPhoto}
                        alt=""
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <LuUser size={20} />
                    )}
                  </div>
                  <div className="feed-body">
                    <span className="feed-author">
                      {p.authorName ?? "אנונימי"}
                    </span>
                    {p.text && <p className="feed-text">{p.text}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick stats bar */}
      <div
        className="card"
        style={{ marginTop: "var(--sp-lg)", textAlign: "center" }}
      >
        <p style={{ fontSize: "0.875rem", color: "var(--c-muted)" }}>
          סה״כ <strong style={{ color: "var(--c-forest)" }}>{users.length}</strong>{" "}
          משתמשים רשומים ·{" "}
          <strong style={{ color: "var(--c-terracotta)" }}>{posts.length}</strong>{" "}
          פוסטים בפיד ·{" "}
          <strong style={{ color: "var(--c-gold)" }}>{pins.length}</strong> נקודות
          חיות
        </p>
      </div>
    </div>
  );
}
