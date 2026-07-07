"use client";

import * as React from "react";
import { Info } from "lucide-react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";

/**
 * "What is NFC?" info trigger + explainer. Dialog on desktop, drawer on
 * mobile (tooltips need hover, which touch screens don't have).
 */
export function WhatIsNfc() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          inline-flex items-center gap-1 shrink-0 text-xs text-(--foreground)
          underline decoration-dotted underline-offset-2
          hover:text-(--ink) transition-colors rounded
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
        "
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
        What is NFC?
      </button>

      <ResponsiveDialog open={open} onOpenChange={setOpen}>
        <ResponsiveDialogContent className="bg-(--background) text-(--ink)">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="text-(--ink)">What is NFC?</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <div className="mt-1 space-y-3 px-4 pb-6 text-sm leading-relaxed text-(--foreground) sm:px-0 sm:pb-2">
            <p>
              It&apos;s the same technology as contactless payment. An NFC sticker
              is a small passive tag that stores a URL. No battery, nothing to
              install. When you tap it, your phone reads the URL and opens it in
              a browser. That&apos;s all BowlSync needs.
            </p>
            <p>
              NTAG213 and NTAG215 stickers both work. They&apos;re inexpensive and
              widely available online. You don&apos;t need to know the tag type in
              advance; NFC Tools figures it out.
            </p>
          </div>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
