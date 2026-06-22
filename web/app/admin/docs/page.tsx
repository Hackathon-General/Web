"use client";

export default function DocsPage() {
  return (
    <div className="animate-fade-in" style={{ direction: "rtl" }}>
      <div className="page-header">
        <h1 className="page-title">📚 מדריך פיתוח</h1>
        <p className="page-subtitle">הוראות והסברים לפיתוח האפליקציה</p>
      </div>

      <div className="card" style={{ maxWidth: 600, padding: "24px" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "12px", fontWeight: 700, color: "var(--c-forest)" }}>
          איך לפתח את האפליקציה
        </h2>
        <p style={{ fontSize: "1rem", color: "var(--c-ink)", lineHeight: 1.6 }}>
          תדברו עם קלוד זה עושה את העבודה
        </p>
      </div>
    </div>
  );
}
