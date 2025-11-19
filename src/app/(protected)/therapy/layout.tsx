// src/app/(protected)/therapy/layout.tsx
"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SessionProvider } from "@/components/SessionSummary";

const NAV = [
  { href: "/app/therapy", label: "Main" },
  // { href: "/app/therapy/therapist", label: "Therapist" },
  // { href: "/app/therapy/engagement", label: "Engagement" },
  // { href: "/app/therapy/summary", label: "Summary" },
];

export default function TherapyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Normalize: some setups won’t include "/app" in URL. Tolerate both.
  const isActive = (href: string) => {
    const clean = href.replace(/^\/app/, "");
    const path = pathname?.replace(/^\/app/, "") || "";
    return path === clean;
  };

  return (
    <SessionProvider initialMeta={{ sessionId: "SSN-PENDING", sessionTitle: "Therapy Session" }}>
      <main className="h-screen-fix relative overflow-hidden">
        {/* BG */}
        <div className="fixed inset-0 -z-10 bg-fixed-ios">
          <Image src="/site-bg.png" alt="site-bg" fill priority className="object-cover" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/0 via-black/0 to-black/10 dark:from-black/10 dark:via-black/15 dark:to-black/40" />
        </div>

        {/* Header — minimal + nav */}
        <header className="relative z-10 px-4 md:px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white shadow">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Therapy Avatar</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Designed for calm, clarity, and play ✨</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 flex-wrap">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href.replace("/app","")} className="no-underline">
                <Button variant={isActive(item.href) ? "default" : "outline"} size="sm">
                  {item.label}
                </Button>
              </Link>
            ))}
            <Badge className="bg-amber-400 text-slate-900 dark:text-black ml-1">Kid Mode</Badge>
          </nav>
        </header>

        <div className="relative z-10 mx-auto container pad-y">
          <Suspense fallback={<div className="p-6 text-muted-foreground">Loading…</div>}>
            {children}
          </Suspense>
        </div>

        <footer className="relative z-10 px-4 md:px-6 pb-8 text-center text-xs text-slate-800 dark:text-white">
          © Global Child Wellness
        </footer>
      </main>
    </SessionProvider>
  );
}
