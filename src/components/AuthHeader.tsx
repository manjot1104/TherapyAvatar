// components/AuthHeader.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser-client";
import { signOutAction } from "@/app/actions/auth";

export default function AuthHeader() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setEmail(user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user?.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
    // TODO: Integrate with i18n or avatar language setting
    console.log("Selected language:", e.target.value);
  };

  return (
    <header className="w-full border-b">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-3">
        <Link href="/" className="font-semibold"></Link>
        <div className="flex items-center gap-4">
          {email && <Link href="/profile" className="text-sm mt-4">{email}</Link>}
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="text-sm border rounded px-3 py-1 bg-white"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Punjabi">Punjabi</option>
          </select>
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
