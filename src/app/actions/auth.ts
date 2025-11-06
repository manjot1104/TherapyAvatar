// app/actions/auth.ts
"use server";

import { serverActionClient } from "@/lib/supabase/server-action-client";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = await serverActionClient();
  await supabase.auth.signOut();
  redirect("/login"); // ✅ sign out → force go to /login
}
