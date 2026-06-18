import Link from "next/link";
import { BackLink } from "@/components/back-link";

export const metadata = {
  title: "How to set up BowlSync",
  description: "A plain-language guide to getting BowlSync running for your household.",
};

const steps = [
  {
    number: 1,
    heading: "Sign in",
    body: (
      <>
        Go to{" "}
        <Link
          href="/login"
          className="underline underline-offset-2 text-[var(--ink)] hover:opacity-70 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          the sign-in page
        </Link>{" "}
        and enter your email. We&apos;ll send you a magic link — click it and
        you&apos;re in. No password required. Google sign-in is also available if
        you&apos;ve set that up in your Supabase project.
      </>
    ),
  },
  {
    number: 2,
    heading: "Create or join a household",
    body: (
      <>
        First time here? Choose{" "}
        <strong className="font-semibold text-[var(--ink)]">Start a household</strong>, enter your
        name, your dog&apos;s name, and a name for the household. You&apos;ll get
        an invite code to share with anyone else who feeds your dog — they can
        enter it on the same screen under{" "}
        <strong className="font-semibold text-[var(--ink)]">Join with a code</strong>. Everyone
        who joins sees the same shared log.
      </>
    ),
  },
  {
    number: 3,
    heading: "(Optional) Write your /fed URL to an NFC tag",
    body: (
      <>
        <p>
          Your BowlSync address ends in{" "}
          <code className="font-mono text-sm bg-[var(--ink)]/8 px-1.5 py-0.5 rounded text-[var(--ink)]">
            /fed
          </code>{" "}
          — for example{" "}
          <code className="font-mono text-sm bg-[var(--ink)]/8 px-1.5 py-0.5 rounded text-[var(--ink)]">
            https://bowlsync.app/fed
          </code>
          . You can put that URL on a cheap NFC sticker so tapping it with your
          phone logs a feeding automatically.
        </p>
        <p className="mt-3">
          <strong className="font-semibold text-[var(--ink)]">What is NFC?</strong> It&apos;s the
          same technology as contactless payment. An NFC sticker is a small passive
          tag that simply stores a URL — it has no battery and nothing to install.
          When you tap it, your phone reads the URL and opens it in a browser.
          That&apos;s all BowlSync needs.
        </p>
        <p className="mt-3">
          To write the tag, download a free app such as{" "}
          <strong className="font-semibold text-[var(--ink)]">NFC Tools</strong> (available on iOS
          and Android). Open it, choose{" "}
          <em>Write</em> → <em>Add a record</em> → <em>URL</em>, paste your{" "}
          <code className="font-mono text-sm bg-[var(--ink)]/8 px-1.5 py-0.5 rounded text-[var(--ink)]">
            /fed
          </code>{" "}
          address, then tap your phone to a blank NFC sticker. The write takes
          about a second.
        </p>
        <p className="mt-3">
          NTAG213 and NTAG215 stickers both work — they&apos;re widely available
          online and inexpensive. You don&apos;t need to know the tag type in
          advance; NFC Tools handles it automatically.
        </p>
      </>
    ),
  },
  {
    number: 4,
    heading: "Stick the tag near the bowl",
    body: (
      <>
        Peel off the adhesive backing and stick the tag somewhere close to your
        dog&apos;s food bowl — the side of a cabinet, the floor nearby, or the
        edge of a mat all work well. Anywhere your phone can reach without
        fumbling is a good spot.
      </>
    ),
  },
  {
    number: 5,
    heading: "Tap to feed",
    body: (
      <>
        Hold your phone within an inch or two of the tag. Your phone will open
        the{" "}
        <code className="font-mono text-sm bg-[var(--ink)]/8 px-1.5 py-0.5 rounded text-[var(--ink)]">
          /fed
        </code>{" "}
        page and log the feeding automatically. If your dog was already fed in
        the last 30 minutes, you&apos;ll see a prompt asking you to confirm before
        anything is recorded — so accidental double-taps are caught before they
        happen. After logging, you&apos;re taken to the status page where you can
        see who fed your dog and when.
      </>
    ),
  },
];

export default function InstructionsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-4 py-12 bg-[var(--background)]">
      <BackLink href="/" label="Back to home" />
      <div className="w-full max-w-prose space-y-10">
        {/* Page header */}
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--ink)]">
            How to set up BowlSync
          </h1>
          <p className="text-base text-[var(--foreground)] max-w-sm mx-auto">
            Five steps from sign-in to tap-to-feed. The NFC tag step is optional
            — you can also log feedings from the app directly.
          </p>
        </header>

        {/* Steps */}
        <ol className="space-y-8" aria-label="Setup steps">
          {steps.map((step) => (
            <li
              key={step.number}
              className="flex gap-5 items-start"
            >
              {/* Step number bubble */}
              <span
                aria-hidden="true"
                className="
                  flex-shrink-0 w-9 h-9 rounded-full
                  flex items-center justify-center
                  bg-[var(--ink)] text-[var(--background)]
                  text-sm font-semibold font-[family-name:var(--font-display)]
                  mt-0.5
                "
              >
                {step.number}
              </span>

              {/* Step content */}
              <div className="space-y-1 flex-1 min-w-0">
                <h2 className="text-base font-semibold font-[family-name:var(--font-display)] text-[var(--ink)] leading-snug">
                  {step.heading}
                </h2>
                <div className="text-sm text-[var(--foreground)] leading-relaxed">
                  {step.body}
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Log without a tag note */}
        <aside
          className="rounded-xl border border-[var(--foreground)]/20 bg-[var(--background)] p-5 space-y-2"
          aria-label="Tip: logging without a tag"
        >
          <p className="text-sm font-semibold text-[var(--ink)] font-[family-name:var(--font-display)]">
            No tag? No problem.
          </p>
          <p className="text-sm text-[var(--foreground)] leading-relaxed">
            You don&apos;t need an NFC tag to use BowlSync. The Bowl Gauge on the
            home screen has a tap-to-feed button, and you can always visit{" "}
            <code className="font-mono text-xs bg-[var(--ink)]/8 px-1 py-0.5 rounded text-[var(--ink)]">
              /fed
            </code>{" "}
            directly in your browser. The tag is just a shortcut.
          </p>
        </aside>

        {/* Footer nav */}
        <nav
          className="flex flex-wrap gap-4 justify-center text-sm"
          aria-label="Page navigation"
        >
          <Link
            href="/"
            className="underline underline-offset-2 text-[var(--foreground)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] transition-colors"
          >
            Back to status
          </Link>
          <Link
            href="/onboarding"
            className="underline underline-offset-2 text-[var(--foreground)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] transition-colors"
          >
            Go to onboarding
          </Link>
        </nav>
      </div>
    </main>
  );
}
