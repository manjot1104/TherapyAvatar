// app/(public)/login/page.tsx
"use client";
import React, { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

function LoginInner() {
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
  const [showPwd, setShowPwd] = useState(false);

  // If already signed in, go to protected home
  useEffect(() => {
    let unsub: { subscription: { unsubscribe: () => void } } | null = null;

    // Show any error forwarded from /auth/callback
    const urlErr = searchParams.get("error");
    const msg = searchParams.get("message");
    if (urlErr || msg) setErr(msg || urlErr || null);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/");
    });

    const s = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) router.replace("/");
    });
    unsub = s.data;

    return () => {
      unsub?.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const redirect =
      typeof window !== "undefined"
        ? window.location.origin + "/auth/callback"
        : undefined;
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
    setLoading(true);
    setErr(null);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) setErr(error.message);
    else router.replace("/");
  }

  async function signInPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) setErr(error.message);
    else router.replace("/");
  }

  async function signUpPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setErr(error.message);
    else setMode("password"); // account created → sign in with password
  }

  async function signInWithGoogle() {
    setErr(null);
    const redirect =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirect },
    });
    if (error) setErr(error.message);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black grid place-items-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="relative rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 shadow-xl backdrop-blur-md">
          {/* Top accent */}
          <div className="absolute inset-x-0 -top-px h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl" />

          <div className="p-7 sm:p-8">
            {/* Brand / Title */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                <span className="text-lg font-bold">GC</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Sign in to continue to Global Child Wellness
              </p>
            </div>

            {/* Segmented tabs */}
            <div className="mb-6 grid grid-cols-3 rounded-xl border bg-zinc-50 text-sm dark:bg-zinc-800/60 overflow-hidden">
              {(["otp", "password", "signup"] as const).map((m) => {
                const active = mode === m;
                return (
                  <button
                    key={m}
                    onClick={() => {
                      setErr(null);
                      setMode(m);
                    }}
                    className={[
                      "py-2.5 transition-colors",
                      active
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
                    ].join(" ")}
                  >
                    {m === "otp" ? "Email OTP" : m === "password" ? "Sign In" : "Sign up"}
                  </button>
                );
              })}
            </div>

            {/* Error banner */}
            {err && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-4 rounded-xl border border-red-300/50 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/40 dark:text-red-300"
              >
                {err}
              </div>
            )}

            {/* Forms */}
            <div className="space-y-6">
              {mode === "otp" &&
                (!otpSent ? (
                  <form onSubmit={sendOtp} className="space-y-4">
                    <LabeledInput
                      label="Email"
                      type="email"
                      icon={<Mail className="h-4 w-4" />}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                    <PrimaryButton loading={loading}>
                      {loading ? "Sending code..." : "Send magic link"}
                    </PrimaryButton>

                    <Divider text="or continue with" />

                    <OAuthButton onClick={signInWithGoogle} provider="Google" />
                    <p className="text-xs text-zinc-500">
                      We’ll email you a secure link. No password needed.
                    </p>
                  </form>
                ) : (
                  <form onSubmit={verifyOtp} className="space-y-4">
                    <LabeledInput
                      label="6-digit code"
                      placeholder="● ● ● ● ● ●"
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                    <PrimaryButton loading={loading}>
                      {loading ? "Verifying..." : "Verify & Continue"}
                    </PrimaryButton>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="block w-full text-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      Didn’t get it? Go back & resend
                    </button>
                  </form>
                ))}

              {mode === "password" && (
                <form onSubmit={signInPassword} className="space-y-4">
                  <LabeledInput
                    label="Email"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <LabeledInput
                    label="Password"
                    type={showPwd ? "text" : "password"}
                    icon={<Lock className="h-4 w-4" />}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        aria-label={showPwd ? "Hide password" : "Show password"}
                      >
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                  <PrimaryButton loading={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </PrimaryButton>

                  <Divider text="or continue with" />
                  <OAuthButton onClick={signInWithGoogle} provider="Google" />

                  <p className="text-xs text-zinc-500">
                    New here?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="underline underline-offset-4 hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                      Create an account
                    </button>
                  </p>
                </form>
              )}

              {mode === "signup" && (
                <form onSubmit={signUpPassword} className="space-y-4">
                  <LabeledInput
                    label="Email"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <LabeledInput
                    label="Create password"
                    type={showPwd ? "text" : "password"}
                    icon={<Lock className="h-4 w-4" />}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        aria-label={showPwd ? "Hide password" : "Show password"}
                      >
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                  <PrimaryButton loading={loading}>
                    {loading ? "Creating..." : "Create account"}
                  </PrimaryButton>

                  <Divider text="or sign up with" />
                  <OAuthButton onClick={signInWithGoogle} provider="Google" />

                  <p className="text-xs text-zinc-500">
                    By continuing, you agree to our Terms & Privacy Policy.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Global Child Wellness
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  // ✅ Wrap the hook-using component in Suspense to satisfy Next 15
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading login…</div>}>
      <LoginInner />
    </Suspense>
  );
}

/* ------------------------------
   Tiny UI helpers (no lib req)
------------------------------ */

function LabeledInput({
  label,
  icon,
  trailing,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {label}
        </span>
      )}
      <div
        className={[
          "group relative flex items-center gap-2 rounded-xl border bg-white/80 dark:bg-zinc-900/60",
          "border-zinc-200 dark:border-zinc-800",
          "focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-200/50 dark:focus-within:ring-indigo-500/20",
          "px-3 py-2.5 transition-shadow",
          className,
        ].join(" ")}
      >
        {icon && <span className="text-zinc-500">{icon}</span>}
        <input
          {...props}
          className="peer w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
        {trailing}
      </div>
    </label>
  );
}

function PrimaryButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={[
        "w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium",
        "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:brightness-105 active:brightness-95",
        "disabled:opacity-60 disabled:cursor-not-allowed",
      ].join(" ")}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

function OAuthButton({
  onClick,
  provider,
}: {
  onClick: () => void;
  provider: "Google";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white/70 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-900"
    >
      <GoogleIcon />
      Continue with {provider}
    </button>
  );
}

function Divider({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-[1px] w-full bg-zinc-200 dark:bg-zinc-800" />
      {text && (
        <span className="text-xs text-zinc-500 whitespace-nowrap">{text}</span>
      )}
      <span className="h-[1px] w-full bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.26-1.66 3.7-5.5 3.7-3.31 0-6-2.73-6-6.1S8.69 5.6 12 5.6c1.89 0 3.16.8 3.89 1.49l2.65-2.55C17.2 3.19 14.8 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c5.77 0 9.58-4.05 9.58-9.76 0-.66-.07-1.16-.16-1.65H12z"
      />
      <path
        fill="#34A853"
        d="M3.15 7.96l3.2 2.35C7.19 8.46 9.41 6.8 12 6.8c1.89 0 3.16.8 3.89 1.49l2.65-2.55C17.2 3.19 14.8 2 12 2 8.4 2 5.32 3.87 3.15 7.96z"
      />
      <path
        fill="#FBBC05"
        d="M12 22c2.72 0 5.01-.9 6.69-2.46l-3.08-2.53c-.85.59-1.99 1.02-3.61 1.02-2.96 0-5.48-2-6.38-4.74l-3.2 2.4C4.57 19.93 8 22 12 22z"
      />
      <path
        fill="#4285F4"
        d="M21.58 12.24c0-.66-.07-1.16-.16-1.65H12v3.9h5.5c-.24 1.26-1.66 3.7-5.5 3.7-3.31 0-6-2.73-6-6.1 0-.75.12-1.46.34-2.11l-3.2-2.35C2.42 8.59 2 10.23 2 12c0 5.52 4.48 10 10 10 5.77 0 9.58-4.05 9.58-9.76z"
      />
    </svg>
  );
}
