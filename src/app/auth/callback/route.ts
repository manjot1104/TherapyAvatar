import { NextResponse, type NextRequest } from "next/server";
import { serverActionClient } from "@/lib/supabase/server-action-client";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = await serverActionClient();
    // This will set the auth cookies server-side
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Optional: handle error from Supabase in the URL and surface it on /login
  const error = url.searchParams.get("error");
  const error_description = url.searchParams.get("error_description");

  const dest = error
    ? `/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(error_description ?? "")}`
    : "/";

  return NextResponse.redirect(new URL(dest, url.origin));
}
