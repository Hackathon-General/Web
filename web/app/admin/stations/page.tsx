"use client";

import { stations, valueTheme, content } from "@/lib/content";
import { LuMapPin, LuWaves, LuMountain, LuPhone, LuTicket } from "react-icons/lu";

export default function StationsPage() {
  const westStations = stations.filter((s) => s.region === "west");
  const eastStations = stations.filter((s) => s.region === "east");

  const paidLabel = (v: string) =>
    v === "yes"
      ? content.ui.yes
      : v === "symbolic"
        ? content.ui.symbolic
        : content.ui.no;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LuMapPin />
          תחנות השביל
        </h1>
        <p className="page-subtitle">
          13 תחנות התנדבות לאורך שביל כרמל-כנרת
        </p>
      </div>

      {/* West region */}
      <h2
        style={{
          fontSize: "1.125rem",
          fontWeight: 800,
          color: "var(--c-ink)",
          marginBottom: "var(--sp-md)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <LuWaves style={{ color: "var(--c-sky)" }} />
        איזור מערבי ({westStations.length} תחנות)
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "var(--sp-md)",
          marginBottom: "var(--sp-xl)",
        }}
      >
        {westStations.map((s) => (
          <StationCard key={s.id} station={s} />
        ))}
      </div>

      {/* East region */}
      <h2
        style={{
          fontSize: "1.125rem",
          fontWeight: 800,
          color: "var(--c-ink)",
          marginBottom: "var(--sp-md)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <LuMountain style={{ color: "var(--c-forest)" }} />
        איזור מזרחי ({eastStations.length} תחנות)
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "var(--sp-md)",
        }}
      >
        {eastStations.map((s) => (
          <StationCard key={s.id} station={s} />
        ))}
      </div>
    </div>
  );
}

function StationCard({ station }: { station: (typeof stations)[number] }) {
  const v = valueTheme[station.value];
  const paidLabel =
    station.paid === "yes"
      ? content.ui.yes
      : station.paid === "symbolic"
        ? content.ui.symbolic
        : content.ui.no;

  return (
    <div className="card" style={{ position: "relative", overflow: "hidden" }}>
      {/* Value strip */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 4,
          height: "100%",
          background: v?.color ?? "#666",
          borderRadius: "0 var(--r-md) var(--r-md) 0",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "var(--sp-sm)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>
          {station.number}. {station.name}
        </h3>
        <span
          className="value-chip"
          style={{ background: v?.color ?? "#666", flexShrink: 0 }}
        >
          {v?.label}
        </span>
      </div>

      <p
        style={{
          fontSize: "0.8125rem",
          color: "var(--c-muted)",
          margin: "0 0 var(--sp-md)",
          lineHeight: 1.5,
        }}
      >
        {station.aboutPlace}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--sp-sm)",
          fontSize: "0.8125rem",
        }}
      >
        <div>
          <span
            style={{
              fontWeight: 700,
              color: "var(--c-terracotta)",
              fontSize: "0.75rem",
            }}
          >
            {content.ui.stationFields.whatYouDo}
          </span>
          <p style={{ margin: "2px 0 0", color: "var(--c-ink)" }}>
            {station.whatYouDo}
          </p>
        </div>
        <div>
          <span
            style={{
              fontWeight: 700,
              color: "var(--c-terracotta)",
              fontSize: "0.75rem",
            }}
          >
            {content.ui.stationFields.openingHours}
          </span>
          <p style={{ margin: "2px 0 0", color: "var(--c-ink)" }}>
            {station.openingHours}
          </p>
        </div>
      </div>

      <div className="section-divider" style={{ margin: "var(--sp-sm) 0" }} />

      <div
        style={{
          display: "flex",
          gap: "var(--sp-md)",
          fontSize: "0.75rem",
          color: "var(--c-muted)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <LuMapPin size={14} /> {station.locationText}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <LuPhone size={14} /> {station.contactName}
          {station.contactPhone ? ` — ${station.contactPhone}` : ""}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <LuTicket size={14} /> {content.ui.stationFields.paid}: {paidLabel}
        </span>
        {station.needsBooking && (
          <span className="badge badge-admin">דורש תיאום מראש</span>
        )}
      </div>
    </div>
  );
}
