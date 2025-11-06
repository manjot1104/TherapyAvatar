// app/(protected)/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import AuthHeader from "@/components/AuthHeader";
import { serverClient } from "@/lib/supabase/server-client";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <>
      <AuthHeader />
      <main className="min-h-screen">{children}</main>
    </>
  );
}
