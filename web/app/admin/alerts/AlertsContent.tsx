"use client";

import { useEffect, useState } from "react";
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
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { colors } from "@/lib/content";

interface AlertDoc {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  title: string;
  message: string;
  createdAt: number;
}

const INITIAL_CENTER: [number, number] = [32.72, 35.27];

const alertIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${colors.danger};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
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

export default function AlertsContent() {
  const [alerts, setAlerts] = useState<AlertDoc[]>([]);
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [radiusM, setRadiusM] = useState("300");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "alerts"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) =>
      setAlerts(
        snap.docs.map(
          (d) => ({ id: d.id, ...(d.data() as object) }) as AlertDoc
        )
      )
    );
    return () => unsub();
  }, []);

  const fire = async () => {
    if (!point || !message) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "alerts"), {
        lat: point.lat,
        lng: point.lng,
        radius: Number(radiusM) || 300,
        title: title || "התראה מההנהלה",
        message,
        createdAt: Date.now(),
      });
      setMessage("");
      setTitle("");
      setPoint(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteDoc(doc(db, "alerts", deleteId));
    setDeleteId(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🚨 שיגור התראות GPS</h1>
        <p className="page-subtitle">
          שלח התראה למטיילים ברדיוס מוגדר על המפה
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
              <MapClickHandler
                onMapClick={(lat, lng) => setPoint({ lat, lng })}
              />
              {point && (
                <>
                  <Marker
                    position={[point.lat, point.lng]}
                    icon={alertIcon}
                  />
                  <Circle
                    center={[point.lat, point.lng]}
                    radius={Number(radiusM) || 300}
                    pathOptions={{
                      color: colors.danger,
                      fillColor: colors.danger,
                      fillOpacity: 0.15,
                    }}
                  />
                </>
              )}
            </MapContainer>
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.8125rem",
              color: "var(--c-muted)",
              marginBottom: "var(--sp-md)",
            }}
          >
            לחץ על המפה כדי לקבוע מרכז הרדיוס
          </p>

          <div className="card">
            <div className="form-group">
              <label className="input-label">כותרת (אופציונלי)</label>
              <input
                className="input"
                placeholder="לדוג׳: שביל חסום"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="input-label">הודעת ההתראה *</label>
              <textarea
                className="input"
                placeholder="פרטי ההתראה..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="input-label">רדיוס (מטרים)</label>
              <input
                className="input"
                type="number"
                placeholder="300"
                value={radiusM}
                onChange={(e) => setRadiusM(e.target.value)}
              />
            </div>
            <button
              className="btn btn-danger btn-pill"
              style={{ width: "100%" }}
              onClick={fire}
              disabled={!point || !message || saving}
            >
              {saving ? "שולח..." : "🚨 שגר התראה"}
            </button>
          </div>
        </div>

        {/* Alerts list */}
        <div className="card">
          <h3 style={{ margin: "0 0 var(--sp-md)", fontWeight: 800 }}>
            היסטוריית התראות ({alerts.length})
          </h3>

          {alerts.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🚨</div>
              <div className="title">אין התראות</div>
              <div className="desc">
                לחץ על המפה ומלא את הטופס לשיגור התראה
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {alerts.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: "var(--sp-md)",
                    border: "1px solid var(--c-line)",
                    borderRadius: "var(--r-sm)",
                    borderRight: "3px solid var(--c-danger)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <strong style={{ fontSize: "0.9375rem" }}>
                      {a.title || "התראה"}
                    </strong>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--c-muted)",
                      }}
                    >
                      {new Date(a.createdAt).toLocaleString("he-IL")}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--c-ink)",
                      margin: "4px 0",
                    }}
                  >
                    {a.message}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--c-muted)",
                      margin: "2px 0 var(--sp-sm)",
                    }}
                  >
                    רדיוס: {a.radius}מ
                  </p>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setDeleteId(a.id)}
                  >
                    🗑️ מחק
                  </button>
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
            <h3>מחיקת התראה</h3>
            <p>האם למחוק את ההתראה?</p>
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
