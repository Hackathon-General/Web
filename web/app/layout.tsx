import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "שביל כרמל-כנרת",
  description: "מערכת קהילה וניהול מרכזית",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning><body className={`${geistSans.className} antialiased bg-slate-950 text-white`} suppressHydrationWarning><AuthProvider>{children}</AuthProvider></body></html>
  );
}