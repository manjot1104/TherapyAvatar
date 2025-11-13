// src/lib/supabase/server-client.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Derive cookie store + set options types from Next's runtime API
type CookieStore = Awaited<ReturnType<typeof cookies>>;
type CookieSetOptions = Parameters<CookieStore["set"]>[2];

/** Safe cookie adapter:
 * - In Server Components, mutations are ignored (Next blocks writes there).
 * - In Route Handlers / Server Actions, writes succeed.
 */
function safeAdapter(cookieStore: CookieStore) {
  return {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options?: CookieSetOptions) {
      try {
        cookieStore.set(name, value, options);
      } catch {
        // In RSC, Next throws on write — swallow to keep read-only behavior safe.
      }
    },
    remove(name: string, options?: CookieSetOptions) {
      try {
        cookieStore.set(name, "", {
          ...(options as any),
          maxAge: 0,
          expires: new Date(0),
        });
      } catch {
        // Same as above
      }
    },
  };
}

/** Use this everywhere in Server Components (read-only OK; writes are safely ignored) */
export async function serverClient() {
  const cookieStore = await cookies(); // ✅ Next 15: cookies() is async
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: safeAdapter(cookieStore),
  });
}

/** Use this in Route Handlers / Server Actions if you need to write cookies */
export async function serverActionClient() {
  const cookieStore = await cookies(); // ✅ async
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieSetOptions) {
        // In server actions/route handlers, writes are allowed
        cookieStore.set(name, value, options);
      },
      remove(name: string, options?: CookieSetOptions) {
        cookieStore.set(name, "", {
          ...(options as any),
          maxAge: 0,
          expires: new Date(0),
        });
      },
    },
  });
}
