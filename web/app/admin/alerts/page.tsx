"use client";

import dynamic from "next/dynamic";

const AlertsContent = dynamic(() => import("./AlertsContent"), {
  ssr: false,
  loading: () => (
    <div className="loading-page" style={{ minHeight: "60vh" }}>
      <div className="spinner" />
    </div>
  ),
});

export default function AlertsPage() {
  return <AlertsContent />;
}
