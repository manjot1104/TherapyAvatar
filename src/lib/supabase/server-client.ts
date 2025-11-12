// src/lib/supabase/server-client.ts
import { cookies, type RequestCookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Safe cookie adapter:
 * - In Server Components, mutations are ignored (Next blocks writes there).
 * - In Route Handlers / Server Actions, writes succeed.
 */
function safeAdapter(cookieStore: RequestCookies) {
  return {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options?: Parameters<RequestCookies["set"]>[2]) {
      try {
        cookieStore.set(name, value, options);
      } catch {}
    },
    remove(name: string, options?: Parameters<RequestCookies["set"]>[2]) {
      try {
        cookieStore.set(name, "", { ...(options as any), maxAge: 0, expires: new Date(0) });
      } catch {}
    },
  };
}

/** Use this everywhere in Server Components (read-only) */
export async function serverClient() {
  const cookieStore = await cookies(); // ✅ Next 15 requires await
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: safeAdapter(cookieStore),
  });
}

/** Use this inside Route Handlers / Server Actions if you need to write cookies */
export async function serverActionClient() {
  const cookieStore = await cookies(); // ✅
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: Parameters<RequestCookies["set"]>[2]) {
        // @ts-expect-error Next 15 types accept this at runtime
        cookieStore.set(name, value, options);
      },
      remove(name: string, options?: Parameters<RequestCookies["set"]>[2]){
        cookieStore.set(name, "", { ...(options as any), maxAge: 0, expires: new Date(0) });
      },
    },
  });
}
