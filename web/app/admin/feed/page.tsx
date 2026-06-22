"use client";

import { useState } from "react";
import { useFeed, deleteFeedPost } from "@/lib/hooks/useFeed";
import { useAuth } from "@/lib/AuthProvider";

export default function FeedPage() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const { posts, loading } = useFeed(200);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = posts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.authorName?.toLowerCase().includes(q)) ||
      (p.text?.toLowerCase().includes(q)) ||
      (p.stationId?.toLowerCase().includes(q))
    );
  });

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteFeedPost(deleteId);
    setDeleteId(null);
  };

  const formatDate = (ts?: number) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📰 ניהול פיד קהילתי</h1>
        <p className="page-subtitle">
          צפייה ומודרציה של פוסטים מהקהילה — {posts.length} פוסטים
        </p>
      </div>

      {/* Search */}
      <div className="search-bar">
        <span className="icon">🔍</span>
        <input
          className="input"
          placeholder="חיפוש לפי שם / תוכן..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingRight: 40 }}
        />
      </div>

      {/* Feed list */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-page" style={{ minHeight: 200 }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📰</div>
            <div className="title">
              {searchQuery ? "אין תוצאות" : "אין פוסטים עדיין"}
            </div>
            <div className="desc">
              {searchQuery
                ? "נסה שאילתה אחרת"
                : "פוסטים מהאפליקציה יופיעו כאן"}
            </div>
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="feed-card">
              <div className="feed-avatar">
                {p.authorPhoto ? (
                  <img
                    src={p.authorPhoto}
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  "👤"
                )}
              </div>
              <div className="feed-body">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="feed-author">
                    {p.authorName ?? "אנונימי"}
                  </span>
                  <span className="feed-time">{formatDate(p.createdAt)}</span>
                  {p.value && (
                    <span
                      className="badge"
                      style={{
                        background: "rgba(44,110,73,0.1)",
                        color: "var(--c-forest)",
                      }}
                    >
                      {p.value}
                    </span>
                  )}
                </div>
                {p.text && <p className="feed-text">{p.text}</p>}
                {p.imageUrl && (
                  <img
                    className="feed-image"
                    src={p.imageUrl}
                    alt="feed"
                    referrerPolicy="no-referrer"
                  />
                )}
                {isAdmin && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 8 }}
                    onClick={() => setDeleteId(p.id)}
                  >
                    🗑️ מחק פוסט
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="dialog-overlay" onClick={() => setDeleteId(null)}>
          <div className="dialog-card" onClick={(e) => e.stopPropagation()}>
            <h3>מחיקת פוסט</h3>
            <p>האם למחוק את הפוסט? לא ניתן לבטל פעולה זו.</p>
            <div className="dialog-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteId(null)}
              >
                ביטול
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                מחק
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
