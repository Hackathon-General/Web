"use client";

import dynamic from "next/dynamic";

const LiveMapContent = dynamic(() => import("./LiveMapContent"), {
  ssr: false,
  loading: () => (
    <div className="loading-page" style={{ minHeight: "60vh" }}>
      <div className="spinner" />
    </div>
  ),
});

export default function LiveMapPage() {
  return <LiveMapContent />;
}
