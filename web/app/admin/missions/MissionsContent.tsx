"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { colors } from "@/lib/content";

interface NFR {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  title: string;
  task: string;
  active: boolean;
  createdAt: number;
}

const INITIAL_CENTER: [number, number] = [32.72, 35.27];

const missionIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${colors.terracotta};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

export default function MissionsContent() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [nfrs, setNfrs] = useState<NFR[]>([]);
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [title, setTitle] = useState("");
  const [task, setTask] = useState("");
  const [radiusM, setRadiusM] = useState("150");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "nfrs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setNfrs(
        snap.docs.map(
          (d) => ({ id: d.id, ...(d.data() as object) }) as NFR
        )
      )
    );
    return () => unsub();
  }, []);

  const save = async () => {
    if (!point || !title) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "nfrs"), {
        lat: point.lat,
        lng: point.lng,
        radius: Number(radiusM) || 150,
        title,
        task,
        active: true,
        createdAt: Date.now(),
      });
      setTitle("");
      setTask("");
      setPoint(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (nfr: NFR) => {
    await updateDoc(doc(db, "nfrs", nfr.id), { active: !nfr.active });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteDoc(doc(db, "nfrs", deleteId));
    setDeleteId(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📋 ניהול משימות (NFR)</h1>
        <p className="page-subtitle">
          הצב משימות התנדבות גיאוגרפיות על השביל
        </p>
      </div>

      <div className="two-col">
        {/* Map + form */}
        <div>
          <div
            className="map-container"
            style={{ height: 300, marginBottom: "var(--sp-md)" }}
          >
            <MapContainer
              center={INITIAL_CENTER}
              zoom={10}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {isAdmin && (
                <MapClickHandler
                  onMapClick={(lat, lng) => setPoint({ lat, lng })}
                />
              )}
              {point && (
                <>
                  <Marker
                    position={[point.lat, point.lng]}
                    icon={missionIcon}
                  />
                  <Circle
                    center={[point.lat, point.lng]}
                    radius={Number(radiusM) || 150}
                    pathOptions={{
                      color: colors.terracotta,
                      fillColor: colors.terracotta,
                      fillOpacity: 0.15,
                    }}
                  />
                </>
              )}
            </MapContainer>
          </div>

          {isAdmin && (
            <p
              style={{
                textAlign: "center",
                fontSize: "0.8125rem",
                color: "var(--c-muted)",
                marginBottom: "var(--sp-md)",
              }}
            >
              לחץ על המפה כדי לקבע מיקום
            </p>
          )}

          {isAdmin ? (
            <div className="card">
              <div className="form-group">
                <label className="input-label">כותרת המשימה *</label>
                <input
                  className="input"
                  placeholder="לדוג׳: ניקוי שביל בהושעיה"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="input-label">תיאור המשימה</label>
                <textarea
                  className="input"
                  placeholder="פירוט המשימה..."
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="input-label">רדיוס (מטרים)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="150"
                  value={radiusM}
                  onChange={(e) => setRadiusM(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary btn-pill"
                style={{ width: "100%" }}
                onClick={save}
                disabled={!point || !title || saving}
              >
                {saving ? "שומר..." : "📋 פרסם משימה"}
              </button>
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "var(--sp-lg)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "var(--sp-sm)" }}>🔒</div>
              <strong style={{ display: "block", marginBottom: 4 }}>מצב צפייה בלבד</strong>
              <p style={{ fontSize: "0.8125rem", color: "var(--c-muted)", margin: 0 }}>
                אין לך הרשאות ליצור, להשבית או למחוק משימות.
              </p>
            </div>
          )}
        </div>

        {/* Missions list */}
        <div className="card">
          <h3 style={{ margin: "0 0 var(--sp-md)", fontWeight: 800 }}>
            משימות קיימות ({nfrs.length})
          </h3>

          {nfrs.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
              <div className="title">אין משימות עדיין</div>
              <div className="desc">
                לחץ על המפה ומלא את הטופס ליצירת משימה
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {nfrs.map((nfr) => (
                <div
                  key={nfr.id}
                  style={{
                    padding: "var(--sp-md)",
                    border: "1px solid var(--c-line)",
                    borderRadius: "var(--r-sm)",
                    opacity: nfr.active ? 1 : 0.6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <strong style={{ fontSize: "0.9375rem" }}>
                      {nfr.title}
                    </strong>
                    <span
                      className={`badge ${nfr.active ? "badge-active" : "badge-inactive"}`}
                    >
                      {nfr.active ? "פעיל" : "לא פעיל"}
                    </span>
                  </div>
                  {nfr.task && (
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--c-muted)",
                        margin: "4px 0",
                      }}
                    >
                      {nfr.task}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--c-muted)",
                      margin: "2px 0 var(--sp-sm)",
                    }}
                  >
                    רדיוס: {nfr.radius}מ ·{" "}
                    {new Date(nfr.createdAt).toLocaleDateString("he-IL")}
                  </p>
                  {isAdmin && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => toggleActive(nfr)}
                      >
                        {nfr.active ? "השבת" : "הפעל"}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteId(nfr.id)}
                      >
                        מחק
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="dialog-overlay" onClick={() => setDeleteId(null)}>
          <div className="dialog-card" onClick={(e) => e.stopPropagation()}>
            <h3>מחיקת משימה</h3>
            <p>האם למחוק את המשימה? לא ניתן לבטל פעולה זו.</p>
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
