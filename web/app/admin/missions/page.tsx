"use client";

import dynamic from "next/dynamic";

const MissionsContent = dynamic(() => import("./MissionsContent"), {
  ssr: false,
  loading: () => (
    <div className="loading-page" style={{ minHeight: "60vh" }}>
      <div className="spinner" />
    </div>
  ),
});

export default function MissionsPage() {
  return <MissionsContent />;
}
