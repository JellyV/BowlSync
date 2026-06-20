"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/history", label: "History" },
  { href: "/instructions", label: "Instructions" },
] as const;

function isActive(pathname: string, href: string): boolean {
  // Exact match for home; prefix-aware for the others (e.g. nested routes).
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * Persistent top navigation. Slim sticky bar with a wordmark on the left and,
 * on the right, inline links on desktop (≥640px) or a hamburger that opens a
 * top drawer on mobile. Rendered on the "ready" pages (home, history,
 * instructions) — not on login / onboarding / fed.
 */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-(--ink)/10 bg-(--background)/95 backdrop-blur-sm supports-backdrop-filter:bg-(--background)/80">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
        <Link
          href="/"
          className="rounded-md font-(family-name:--font-display) text-lg font-bold text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)"
        >
          BowlSync <span className="emoji ml-0.5">🐾</span>
        </Link>

        {/* Desktop inline nav */}
        <nav className="hidden items-center gap-6 sm:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={cn(
                "rounded-md text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)",
                isActive(pathname, link.href)
                  ? "font-semibold text-(--ink)"
                  : "text-(--foreground) hover:text-(--ink)"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger → top drawer */}
        <Drawer direction="top">
          <DrawerTrigger
            aria-label="Open menu"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "text-(--ink) sm:hidden"
            )}
          >
            <Menu />
          </DrawerTrigger>
          <DrawerContent className="bg-(--background)">
            <DrawerTitle className="sr-only">Navigation menu</DrawerTitle>
            <div className="flex items-center justify-between px-4 pt-4">
              <span className="font-(family-name:--font-display) text-lg font-bold text-(--ink)">
                BowlSync <span className="emoji ml-0.5">🐾</span>
              </span>
              <DrawerClose
                aria-label="Close menu"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "text-(--ink)"
                )}
              >
                <X />
              </DrawerClose>
            </div>
            <nav className="flex flex-col p-4 pt-2" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <DrawerClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    aria-current={
                      isActive(pathname, link.href) ? "page" : undefined
                    }
                    className={cn(
                      "rounded-lg px-3 py-3 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)",
                      isActive(pathname, link.href)
                        ? "bg-(--ink)/8 font-semibold text-(--ink)"
                        : "text-(--foreground) hover:bg-(--ink)/5 hover:text-(--ink)"
                    )}
                  >
                    {link.label}
                  </Link>
                </DrawerClose>
              ))}
            </nav>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
}
