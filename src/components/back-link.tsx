import Link from "next/link";

/**
 * Top-left back arrow with an EXPLICIT destination (never browser history),
 * so it can't trap the user cycling between URLs. Each page passes the page
 * that makes sense to return to. Rendered on every screen except home and login.
 */
export function BackLink({ href, label = "Back" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="
        fixed left-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center
        rounded-full text-(--ink) hover:bg-(--ink)/8 active:bg-(--ink)/12
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
        transition-colors
      "
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}
