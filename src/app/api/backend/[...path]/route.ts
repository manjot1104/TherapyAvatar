// src/app/api/backend/[...path]/route.ts
// Same-origin proxy to the Express backend to avoid CORS and HTTPS mismatch in dev.
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function getBackendBase(): string {
  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000"
  );
}

async function forward(req: NextRequest, method: string) {
  const base = getBackendBase().replace(/\/+$/, "");
  const { pathname, search } = new URL(req.url);
  // pathname ends with /api/backend/<path>; strip the prefix
  const prefix = "/api/backend/";
  const idx = pathname.indexOf(prefix);
  const rest = idx >= 0 ? pathname.slice(idx + prefix.length) : "";
  const targetUrl = `${base}/${rest}${search || ""}`;

  // Clone headers, drop host, accept-encoding
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("accept-encoding");

  const init: RequestInit = {
    method,
    headers,
    redirect: "manual",
    // Only attach body for appropriate methods
    body:
      method === "GET" || method === "HEAD" ? undefined : (req.body as any),
  };

  const upstream = await fetch(targetUrl, init);

  // Stream back the response as-is
  const respHeaders = new Headers(upstream.headers);
  // Ensure CORP allows same-origin consumption
  respHeaders.set("Cross-Origin-Resource-Policy", "same-origin");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}

export async function GET(req: NextRequest) {
  return forward(req, "GET");
}
export async function POST(req: NextRequest) {
  return forward(req, "POST");
}
export async function PUT(req: NextRequest) {
  return forward(req, "PUT");
}
export async function PATCH(req: NextRequest) {
  return forward(req, "PATCH");
}
export async function DELETE(req: NextRequest) {
  return forward(req, "DELETE");
}
export async function HEAD(req: NextRequest) {
  return forward(req, "HEAD");
}

