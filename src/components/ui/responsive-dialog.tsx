"use client";

/**
 * ResponsiveDialog (Credenza pattern)
 *
 * Renders a centered Dialog on desktop (≥640px) and a bottom Drawer on mobile.
 * Children are written ONCE — no content duplication in the caller.
 *
 * Single source of truth: the Root computes `isDesktop` once and shares it via
 * React Context. Every subcomponent reads the SAME value, so the Root's
 * Dialog/Drawer choice and each descendant's choice can never disagree within a
 * render. (Deriving `isDesktop` independently per component lets the Root render
 * a Dialog while a child renders a Drawer subtree, which throws
 * "DialogPortal must be used within Dialog" because vaul's Drawer portal then
 * has no Drawer.Root ancestor.)
 *
 * Hydration note: `isDesktop` starts false (SSR / first paint) then corrects in
 * useEffect. Because these components only render their content after `open`
 * becomes true (a user action, post-hydration), the brief false→true switch is
 * invisible and produces no hydration mismatch.
 */

import * as React from "react";
import { useIsDesktop } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// Shared breakpoint value. Defaults to false (mobile) — matches SSR and is
// overridden by the Root's provider in every real usage.
const ResponsiveDialogContext = React.createContext(false);
function useResponsiveIsDesktop() {
  return React.useContext(ResponsiveDialogContext);
}

// ── Root ───────────────────────────────────────────────────────────────────

interface ResponsiveDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

function ResponsiveDialog({
  open,
  onOpenChange,
  children,
}: ResponsiveDialogProps) {
  const isDesktop = useIsDesktop();

  return (
    <ResponsiveDialogContext.Provider value={isDesktop}>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      )}
    </ResponsiveDialogContext.Provider>
  );
}

// ── Content ────────────────────────────────────────────────────────────────

function ResponsiveDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
  const isDesktop = useResponsiveIsDesktop();

  if (isDesktop) {
    return (
      <DialogContent className={className} {...(props as React.ComponentProps<typeof DialogContent>)}>
        {children}
      </DialogContent>
    );
  }

  return (
    <DrawerContent className={className}>
      {children}
    </DrawerContent>
  );
}

// ── Header ─────────────────────────────────────────────────────────────────

function ResponsiveDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isDesktop = useResponsiveIsDesktop();

  if (isDesktop) {
    return <DialogHeader className={className} {...props} />;
  }
  return <DrawerHeader className={className} {...props} />;
}

// ── Title ──────────────────────────────────────────────────────────────────

function ResponsiveDialogTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  const isDesktop = useResponsiveIsDesktop();

  if (isDesktop) {
    return <DialogTitle className={className} {...(props as React.ComponentProps<typeof DialogTitle>)} />;
  }
  return <DrawerTitle className={className} {...(props as React.ComponentProps<typeof DrawerTitle>)} />;
}

// ── Description ────────────────────────────────────────────────────────────

function ResponsiveDialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const isDesktop = useResponsiveIsDesktop();

  if (isDesktop) {
    return <DialogDescription className={className} {...(props as React.ComponentProps<typeof DialogDescription>)} />;
  }
  return <DrawerDescription className={className} {...(props as React.ComponentProps<typeof DrawerDescription>)} />;
}

// ── Footer ─────────────────────────────────────────────────────────────────

function ResponsiveDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isDesktop = useResponsiveIsDesktop();

  if (isDesktop) {
    return <DialogFooter className={className} {...props} />;
  }
  return <DrawerFooter className={className} {...props} />;
}

// ── Close ──────────────────────────────────────────────────────────────────

function ResponsiveDialogClose({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const isDesktop = useResponsiveIsDesktop();

  if (isDesktop) {
    return <DialogClose className={className} {...(props as React.ComponentProps<typeof DialogClose>)} />;
  }
  return <DrawerClose className={className} {...(props as React.ComponentProps<typeof DrawerClose>)} />;
}

export {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
};
