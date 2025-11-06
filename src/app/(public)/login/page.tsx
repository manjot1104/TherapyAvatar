// app/(public)/login/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"otp" | "password" | "signup">("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // If already signed in, go to protected home
  useEffect(() => {
    let unsub: { subscription: { unsubscribe: () => void } } | null = null;

    // Show any error forwarded from /auth/callback
    const urlErr = searchParams.get("error");
    const msg = searchParams.get("message");
    if (urlErr || msg) setErr(msg || urlErr);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/");
    });
    const s = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) router.replace("/");
    });
    unsub = s.data;
    return () => unsub?.subscription.unsubscribe();
  }, [searchParams]);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const redirect = typeof window !== "undefined" ? window.location.origin + "/auth/callback" : undefined;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirect },
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setOtpSent(true);
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    setLoading(false);
    if (error) setErr(error.message);
    else router.replace("/");
  }

  async function signInPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErr(error.message);
    else router.replace("/");
  }

  async function signUpPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setErr(error.message);
    else setMode("password"); // account created → sign in with password
  }

  async function signInWithGoogle() {
    setErr(null);
    const redirect = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirect },
    });
    if (error) setErr(error.message);
    // Supabase will navigate to Google, then back to /auth/callback
  }

  return (
    <div className="min-h-[70vh] grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border shadow p-6 space-y-5">
        <h1 className="text-2xl font-semibold">Sign in</h1>

        <div className="flex gap-2 text-sm">
          <button
            className={`px-3 py-1 rounded border ${mode === "otp" ? "bg-slate-100" : ""}`}
            onClick={() => { setErr(null); setMode("otp"); }}
          >
            Email OTP
          </button>
          <button
            className={`px-3 py-1 rounded border ${mode === "password" ? "bg-slate-100" : ""}`}
            onClick={() => { setErr(null); setMode("password"); }}
          >
            Password
          </button>
          <button
            className={`px-3 py-1 rounded border ${mode === "signup" ? "bg-slate-100" : ""}`}
            onClick={() => { setErr(null); setMode("signup"); }}
          >
            Sign up
          </button>
        </div>

        {mode === "otp" && (
          !otpSent ? (
            <form onSubmit={sendOtp} className="space-y-3">
              <input
                className="w-full border rounded-lg p-3"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button disabled={loading} className="w-full rounded-xl p-3 border">
                {loading ? "Sending code..." : "Send magic link"}
              </button>
              <button type="button" onClick={signInWithGoogle} className="w-full rounded-xl p-3 border">
                Continue with Google
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-3">
              <input
                className="w-full border rounded-lg p-3 tracking-widest"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <button disabled={loading} className="w-full rounded-xl p-3 border">
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>
          )
        )}

        {mode === "password" && (
          <form onSubmit={signInPassword} className="space-y-3">
            <input
              className="w-full border rounded-lg p-3"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="w-full border rounded-lg p-3"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button disabled={loading} className="w-full rounded-xl p-3 border">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={signUpPassword} className="space-y-3">
            <input
              className="w-full border rounded-lg p-3"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="w-full border rounded-lg p-3"
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button disabled={loading} className="w-full rounded-xl p-3 border">
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        )}

        {err && <p className="text-red-600 text-sm">{err}</p>}
      </div>
    </div>
  );
}
