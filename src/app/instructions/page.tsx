import Link from "next/link";
import { ChevronDown, Nfc, Smartphone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { WhatIsNfc } from "@/components/what-is-nfc";

export const metadata = {
  title: "How to set up BowlSync",
  description:
    "A plain-language guide to getting BowlSync running for your household.",
};

const FED_URL = "https://bowl-sync.vercel.app/fed";

function CodeChip({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[13px] bg-(--ink)/8 px-1.5 py-0.5 rounded text-(--ink) break-all">
      {children}
    </code>
  );
}

/** Numbered vertical steps with dotted connectors between the circles. */
function Stepper({ steps }: { steps: React.ReactNode[] }) {
  return (
    <ol className="mt-1">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              aria-hidden="true"
              className="
                flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                bg-(--ink) text-(--background)
                text-xs font-semibold font-(family-name:--font-display)
              "
            >
              {i + 1}
            </span>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="my-1 flex-1 border-l-2 border-dotted border-(--foreground)/40"
              />
            )}
          </div>
          <div
            className={`pt-0.5 text-sm leading-relaxed text-(--foreground) ${
              i < steps.length - 1 ? "pb-4" : ""
            }`}
          >
            {step}
          </div>
        </li>
      ))}
    </ol>
  );
}

function OsAccordion({
  label,
  steps,
}: {
  label: string;
  steps: React.ReactNode[];
}) {
  return (
    <details
      name="phone-os"
      className="group border-b border-(--foreground)/15 last:border-b-0"
    >
      <summary
        className="
          flex cursor-pointer list-none items-center justify-between gap-2
          px-1 py-3 text-sm font-semibold text-(--ink)
          font-(family-name:--font-display)
          [&::-webkit-details-marker]:hidden
          rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
        "
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 text-(--foreground) transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="px-1 pb-4">
        <Stepper steps={steps} />
      </div>
    </details>
  );
}

const IPHONE_STEPS: React.ReactNode[] = [
  <>
    Open the <strong className="font-semibold text-(--ink)">Shortcuts</strong>{" "}
    app. It comes preinstalled on every iPhone.
  </>,
  <>
    Tap the <strong className="font-semibold text-(--ink)">+</strong> button in
    the top corner.
  </>,
  <>
    Search for &ldquo;url&rdquo; and pick{" "}
    <strong className="font-semibold text-(--ink)">Open URLs</strong>.
  </>,
  <>
    Type <CodeChip>{FED_URL}</CodeChip> into the action.
  </>,
  <>
    That&apos;s it. Tap the shortcut to log a feeding. You can also add it to
    your Home Screen like an app, or put a Shortcuts widget on the widget page
    to the left of your Home Screen.
  </>,
];

const ANDROID_STEPS: React.ReactNode[] = [
  <>
    Open <CodeChip>{FED_URL}</CodeChip> in Chrome.
  </>,
  <>
    Tap the <strong className="font-semibold text-(--ink)">&#8942;</strong> menu
    in the top corner.
  </>,
  <>
    Choose{" "}
    <strong className="font-semibold text-(--ink)">Add to Home screen</strong>.
    The new icon logs a feeding in one tap.
  </>,
];

export default function InstructionsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen flex-col items-center justify-start px-4 py-12 bg-(--background)">
        <div className="space-y-10 w-full max-w-2xl">
          {/* Page header */}
          <header className="space-y-2 text-center">
            <h1 className="text-3xl font-bold font-(family-name:--font-display) text-(--ink)">
              How to set up BowlSync
            </h1>
            <p className="text-base text-(--foreground) max-w-sm mx-auto">
              Two steps: sign in, then set up a one-tap shortcut for logging
              feedings.
            </p>
          </header>

          {/* Step 1 — sign in & household */}
          <section
            className="flex items-start gap-5"
            aria-label="Step 1: sign in"
          >
            <span
              aria-hidden="true"
              className="
                flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                bg-(--ink) text-(--background)
                text-sm font-semibold font-(family-name:--font-display) mt-0.5
              "
            >
              1
            </span>
            <div className="flex-1 space-y-2 min-w-0">
              <h2 className="text-base font-semibold font-(family-name:--font-display) text-(--ink) leading-snug">
                Sign in and set up your household
              </h2>
              <div className="rounded-xl border border-(--foreground)/20 p-5 text-sm leading-relaxed text-(--foreground) space-y-3">
                <p>
                  Go to{" "}
                  <Link
                    href="/login"
                    className="underline underline-offset-2 text-(--ink) hover:opacity-70 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)"
                  >
                    the sign-in page
                  </Link>{" "}
                  and enter your email. We&apos;ll send you a magic link. Click
                  it and you&apos;re in. No password needed.
                </p>
                <p>
                  First time here? Choose{" "}
                  <strong className="font-semibold text-(--ink)">
                    Start a household
                  </strong>{" "}
                  and enter your name and your pet&apos;s name. Got an invite
                  code from someone? Enter it under{" "}
                  <strong className="font-semibold text-(--ink)">
                    Join with a code
                  </strong>{" "}
                  instead. Everyone in a household sees the same feeding log.
                </p>
              </div>
            </div>
          </section>

          {/* Step 2 — shortcut, two approaches */}
          <section
            className="flex items-start gap-5"
            aria-label="Step 2: set up a shortcut"
          >
            <span
              aria-hidden="true"
              className="
                flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                bg-(--ink) text-(--background)
                text-sm font-semibold font-(family-name:--font-display) mt-0.5
              "
            >
              2
            </span>
            <div className="flex-1 space-y-2 min-w-0">
              <h2 className="text-base font-semibold font-(family-name:--font-display) text-(--ink) leading-snug">
                Set up a shortcut to log feedings
              </h2>
              <p className="text-sm text-(--foreground)">
                Pick either approach.
              </p>

              <div className="items-start gap-4 grid sm:grid-cols-2 pt-1">
                {/* Approach 1: phone shortcut */}
                <div className="rounded-xl border border-(--foreground)/20 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold font-(family-name:--font-display) text-(--ink)">
                    <Smartphone
                      className="h-4 w-4 text-(--accent)"
                      aria-hidden="true"
                    />
                    Phone shortcut
                  </h3>
                  <p className="mt-1 mb-2 text-sm leading-relaxed text-(--foreground)">
                    A one-tap icon on your phone that opens the feeding page.
                  </p>
                  <OsAccordion label="iPhone" steps={IPHONE_STEPS} />
                  <OsAccordion label="Android" steps={ANDROID_STEPS} />
                </div>

                {/* Approach 2: NFC tag */}
                <div className="rounded-xl border border-(--foreground)/20 p-5">
                  <div className="flex justify-between items-center gap-2">
                    <h3 className="flex items-center gap-2 text-sm font-semibold font-(family-name:--font-display) text-(--ink)">
                      <Nfc
                        className="h-4 w-4 text-(--accent)"
                        aria-hidden="true"
                      />
                      NFC tag
                    </h3>
                    <WhatIsNfc />
                  </div>
                  <div className="mt-2 space-y-3 text-sm leading-relaxed text-(--foreground)">
                    <p>
                      A sticker near the bowl. Tap it with your phone and the
                      feeding is logged. No screen, no app to find.
                    </p>
                    <p>
                      Download the free{" "}
                      <strong className="font-semibold text-(--ink)">
                        NFC Tools
                      </strong>{" "}
                      app (iOS and Android). Choose <em>Write</em> &rarr;{" "}
                      <em>Add a record</em> &rarr; <em>URL</em>, paste{" "}
                      <CodeChip>{FED_URL}</CodeChip>, then hold your phone to a
                      blank sticker.
                    </p>
                    <p>
                      Stick it somewhere close to your pet&apos;s bowl. The side
                      of a cabinet, the floor nearby, or the edge of a mat all
                      work well.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* No-shortcut note */}
          <aside
            className="rounded-xl border border-(--foreground)/20 p-5 space-y-2"
            aria-label="Tip: logging without a shortcut"
          >
            <p className="text-sm font-semibold text-(--ink) font-(family-name:--font-display)">
              No shortcut? No problem.
            </p>
            <p className="text-sm text-(--foreground) leading-relaxed">
              The Bowl Gauge on the home screen has a tap-to-feed button, and{" "}
              <CodeChip>/fed</CodeChip> works from any browser. If your pet
              already ate in the last 30 minutes, the page asks you to confirm
              before recording anything, so accidental double-taps don&apos;t
              count.
            </p>
          </aside>

          {/* Footer nav */}
          <nav
            className="flex flex-wrap justify-center gap-4 text-sm"
            aria-label="Page navigation"
          >
            <Link
              href="/"
              className="underline underline-offset-2 text-(--foreground) hover:text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent) transition-colors"
            >
              Back to status
            </Link>
          </nav>
        </div>
      </main>
    </>
  );
}
