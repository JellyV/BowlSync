"use client";

import { useActionState } from "react";
import { joinHousehold } from "@/actions/household";

type JoinState = { error?: string } | null;

async function joinAction(
  _prev: JoinState,
  formData: FormData
): Promise<JoinState> {
  const inviteCode = formData.get("inviteCode") as string;
  const displayName = formData.get("displayName") as string;
  return joinHousehold({ inviteCode, displayName });
}

export function JoinHouseholdForm() {
  const [state, formAction, isPending] = useActionState(joinAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label
          htmlFor="join-inviteCode"
          className="block text-sm font-medium text-[var(--ink)]"
        >
          Invite code
        </label>
        <input
          id="join-inviteCode"
          name="inviteCode"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          required
          placeholder="e.g. ABC123"
          disabled={isPending}
          className="
            w-full rounded-lg border border-[var(--foreground)]/30 bg-[var(--background)]/60
            px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--foreground)]/50
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            font-[family-name:var(--font-mono)] tracking-wider uppercase
            transition-shadow
          "
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="join-displayName"
          className="block text-sm font-medium text-[var(--ink)]"
        >
          Your name
        </label>
        <input
          id="join-displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          required
          placeholder="What should we call you?"
          disabled={isPending}
          className="
            w-full rounded-lg border border-[var(--foreground)]/30 bg-[var(--background)]/60
            px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--foreground)]/50
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-shadow
          "
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-[var(--status-stale)]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="
          w-full rounded-lg bg-[var(--ink)] px-4 py-2.5
          text-sm font-medium text-[var(--background)]
          hover:opacity-90 active:opacity-80
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-opacity
        "
      >
        {isPending ? "Joining…" : "Join household"}
      </button>
    </form>
  );
}
