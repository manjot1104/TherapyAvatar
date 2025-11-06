// components/AuthHeader.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser-client";
import { signOutAction } from "@/app/actions/auth";

export default function AuthHeader() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setEmail(user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user?.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="w-full border-b">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-3">
        <Link href="/" className="font-semibold">YourApp</Link>
        <div className="flex items-center gap-3">
          {email && <Link href="/profile" className="text-sm">{email}</Link>}
          <form action={signOutAction}>
            <button type="submit" className="text-sm border rounded px-3 py-1">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
