// components/AuthHeader.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function AuthHeader() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");

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
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="text-sm border rounded px-3 py-1 bg-white"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Punjabi">Punjabi</option>
          </select>
        </div>
      </div>
    </header>
  );
}
