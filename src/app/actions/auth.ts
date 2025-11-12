// src/app/actions/auth.ts
"use server";

import { serverClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/login");
}
