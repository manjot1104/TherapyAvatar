// lib/supabase/server-action-client.ts (mutable for actions)
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function serverActionClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (n: string, v: string, o?: Parameters<typeof cookieStore.set>[2]) => cookieStore.set(n, v, o as any),
        remove: (n: string, o?: Parameters<typeof cookieStore.set>[2]) => cookieStore.set(n, "", { ...(o as any), maxAge: 0 }),
      },
    }
  );
}
