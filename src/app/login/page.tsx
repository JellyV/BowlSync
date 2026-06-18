"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

type State = "idle" | "sending" | "sent" | "error";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const callbackUrl = `/auth/callback?next=${encodeURIComponent(next)}`;

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("sending");
    setErrorMsg("");

    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}${callbackUrl}`,
      },
    });

    if (error) {
      setState("error");
      setErrorMsg(error.message);
    } else {
      setState("sent");
    }
  }

  async function handleGoogle() {
    setState("sending");
    setErrorMsg("");

    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${callbackUrl}`,
      },
    });

    if (error) {
      setState("error");
      setErrorMsg(error.message);
    }
  }

  if (state === "sent") {
    return (
      <div className="text-center space-y-3">
        <p className="text-lg font-[family-name:var(--font-display)] text-[var(--ink)]">
          Check your inbox.
        </p>
        <p className="text-sm text-[var(--foreground)]">
          We sent a link to <span className="font-medium">{email}</span>. It expires in an hour.
        </p>
        <button
          onClick={() => { setState("idle"); setEmail(""); }}
          className="text-sm underline text-[var(--foreground)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] transition-colors"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleMagicLink} className="space-y-4 w-full">
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-[var(--ink)]">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "sending"}
          placeholder="you@example.com"
          className="
            w-full rounded-lg border border-[var(--foreground)]/30 bg-(--background)/60
            px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--foreground)]/50
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-shadow
          "
        />
      </div>

      {state === "error" && errorMsg && (
        <p role="alert" className="text-sm text-[var(--status-stale)]">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending" || !email.trim()}
        className="
          w-full rounded-lg bg-[var(--ink)] px-4 py-2.5
          text-sm font-medium text-[var(--background)]
          hover:opacity-90 active:opacity-80
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-opacity
        "
      >
        {state === "sending" ? "Sending…" : "Send magic link"}
      </button>

      <div className="relative flex items-center gap-3 py-1">
        <div className="flex-1 border-t border-[var(--foreground)]/20" />
        <span className="text-xs text-[var(--foreground)]/60 shrink-0">or</span>
        <div className="flex-1 border-t border-[var(--foreground)]/20" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={state === "sending"}
        className="
          w-full flex items-center justify-center gap-2 rounded-lg
          border border-[var(--foreground)]/30 bg-(--background)/60 px-4 py-2.5
          text-sm font-medium text-[var(--ink)]
          hover:bg-(--background)/80 active:bg-(--background)/50
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors
        "
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-[var(--background)]">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-[family-name:var(--font-display)] font-semibold text-[var(--ink)]">
            Sign in to BowlSync
          </h1>
          <p className="text-sm text-[var(--foreground)]">
            Tap the link we email you, or use Google.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-48 flex items-center justify-center text-sm text-[var(--foreground)]/60">
              Loading…
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
