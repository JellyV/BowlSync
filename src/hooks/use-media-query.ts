import * as React from "react";

/**
 * SSR-safe media query hook.
 * Starts false (mobile-first) and corrects in useEffect with a change listener.
 * Because the dialog only opens after user interaction (post-hydration), the
 * brief false→true transition is invisible and causes no hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    // Set immediately on mount so the initial render is correct client-side
    setMatches(mql.matches);

    function handleChange(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

/** Convenience hook: true when viewport is ≥640px (Tailwind sm breakpoint). */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 640px)");
}
