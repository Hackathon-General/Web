"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";

export default function Home() {
  const { user, role, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    if (user && role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/login");
    }
  }, [user, role, initializing, router]);

  return (
    <div className="loading-page">
      <div className="spinner" />
    </div>
  );
}
