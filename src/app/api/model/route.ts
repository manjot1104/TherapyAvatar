// src/app/api/model/route.ts
// Simple same-origin proxy for GLB models to bypass COEP/CORP issues
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const src = searchParams.get("src");
    if (!src) {
      return new Response(JSON.stringify({ error: "Missing src param" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Basic allowlist: only http/https
    if (!/^https?:\/\//i.test(src)) {
      return new Response(JSON.stringify({ error: "Invalid src" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let upstream: Response;
    try {
      upstream = await fetch(src, {
        method: "GET",
        // Keep headers minimal; some browser-only headers are forbidden in server fetch.
        headers: {
          "User-Agent": "TherapyAvatarProxy/1.0 (+https://localhost)",
          Accept: "model/gltf-binary,application/octet-stream,*/*",
        },
        cache: "no-store",
        redirect: "follow",
      });
    } catch (e: any) {
      return new Response(
        JSON.stringify({ error: "Upstream fetch failed", proxy_error: "network", detail: e?.message || String(e) }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    if (!upstream.ok || !upstream.body) {
      let txt = "";
      try {
        txt = await (upstream as any).text?.();
      } catch {}
      return new Response(JSON.stringify({ error: "Upstream fetch failed", status: (upstream as any)?.status ?? 502, detail: txt }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Stream back with proper content type
    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("content-type") || "model/gltf-binary");
    const len = upstream.headers.get("content-length");
    if (len) headers.set("Content-Length", len);
    headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    // Same-origin resource policy so COEP/COOP is happy
    headers.set("Cross-Origin-Resource-Policy", "same-origin");

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "Proxy error", detail: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function HEAD(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const src = searchParams.get("src");
    if (!src || !/^https?:\/\//i.test(src)) {
      return new Response(null, { status: 400 });
    }
    // Try a HEAD first; some CDNs may not allow it, so fall back to a range GET
    let upstream = await fetch(src, { method: "HEAD", cache: "no-store" });
    if (!upstream.ok) {
      upstream = await fetch(src, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        cache: "no-store",
      });
      if (!upstream.ok) return new Response(null, { status: upstream.status });
    }
    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("content-type") || "model/gltf-binary");
    headers.set("Content-Length", upstream.headers.get("content-length") || "0");
    headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    headers.set("Cross-Origin-Resource-Policy", "same-origin");
    return new Response(null, { status: 200, headers });
  } catch {
    return new Response(null, { status: 500 });
  }
}

