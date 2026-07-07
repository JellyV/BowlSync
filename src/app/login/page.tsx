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
            Tap the link we email you. No password needed.
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
