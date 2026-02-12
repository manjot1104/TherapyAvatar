// app/(protected)/layout.tsx
import { ReactNode } from "react";
import AuthHeader from "@/components/AuthHeader";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthHeader />
      <main className="min-h-screen">{children}</main>
    </>
  );
}
