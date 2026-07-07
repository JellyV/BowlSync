"use client";

import * as React from "react";
import { Check, Copy, Share2 } from "lucide-react";

interface InviteCardProps {
  code: string;
  petName: string;
  householdName: string;
}

export function InviteCard({ code, petName, householdName }: InviteCardProps) {
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [copiedShare, setCopiedShare] = React.useState(false);
  const codeTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const shareTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    return () => {
      clearTimeout(codeTimer.current);
      clearTimeout(shareTimer.current);
    };
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    clearTimeout(codeTimer.current);
    codeTimer.current = setTimeout(() => setCopiedCode(false), 2000);
  }

  async function handleShare() {
    const message = `Join ${householdName} on BowlSync with code ${code} — ${window.location.origin}`;
    if (navigator.share) {
      try {
        await navigator.share({ text: message });
      } catch {
        // User dismissed the share sheet — nothing to do.
      }
    } else {
      await navigator.clipboard.writeText(message);
      setCopiedShare(true);
      clearTimeout(shareTimer.current);
      shareTimer.current = setTimeout(() => setCopiedShare(false), 2000);
    }
  }

  return (
    <section
      className="rounded-xl border border-(--foreground)/20 bg-(--background) p-5 space-y-3"
      aria-label="Invite someone"
    >
      <div className="space-y-1">
        <h2 className="text-xs font-semibold font-mono uppercase tracking-wide text-(--foreground)">
          Invite someone
        </h2>
        <p className="text-sm text-(--foreground) leading-relaxed">
          Anyone who feeds {petName} can join with this code.
        </p>
      </div>

      <div className="rounded-lg border-2 border-dashed border-(--foreground)/50 py-3.5 text-center">
        <span className="font-mono text-2xl tracking-[0.35em] indent-[0.35em] text-(--ink)">
          {code}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="
            flex-1 inline-flex items-center justify-center gap-1.5
            rounded-lg bg-(--ink) px-4 py-2 text-sm font-semibold text-(--background)
            hover:opacity-90 active:opacity-80 transition-opacity
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
          "
        >
          {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copiedCode ? "Copied" : "Copy code"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="
            flex-1 inline-flex items-center justify-center gap-1.5
            rounded-lg border border-(--ink)/35 px-4 py-2 text-sm font-semibold text-(--ink)
            hover:bg-(--ink)/5 active:bg-(--ink)/10 transition-colors
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
          "
        >
          {copiedShare ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          {copiedShare ? "Copied" : "Share"}
        </button>
      </div>

      <p className="text-xs text-(--foreground) leading-relaxed text-center">
        They sign in to BowlSync, choose{" "}
        <strong className="font-semibold text-(--ink)">Join with a code</strong>, and enter it.
      </p>
    </section>
  );
}
