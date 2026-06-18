import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth-context";
import { createHousehold } from "@/actions/household";
import { JoinHouseholdForm } from "@/components/JoinHouseholdForm";
import { BackLink } from "@/components/back-link";
import { PetTypeSelect } from "@/components/pet-type-select";

async function createAction(formData: FormData) {
  "use server";
  const householdName = formData.get("householdName") as string;
  const displayName = formData.get("displayName") as string;
  const petName = formData.get("petName") as string;
  const petType = (formData.get("petType") as string) ?? "dog";
  await createHousehold({ householdName, displayName, petName, petType });
}

export default async function OnboardingPage() {
  const ctx = await getUserContext();
  if (ctx.status === "ready") redirect("/");

  return (
    <main className="flex min-h-screen items-start justify-center px-4 py-16 bg-[var(--background)]">
      <BackLink href="/login" label="Back to sign in" />
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-[family-name:var(--font-display)] font-semibold text-[var(--ink)]">
            Set up BowlSync
          </h1>
          <p className="text-sm text-[var(--foreground)]">
            Start a new household or join one that&apos;s already running.
          </p>
        </div>

        {/* Start a household */}
        <section className="rounded-xl border border-[var(--foreground)]/20 bg-[var(--background)] p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-[family-name:var(--font-display)] font-semibold text-[var(--ink)]">
              Start a household
            </h2>
            <p className="text-sm text-[var(--foreground)]">
              Create a new household and invite others later.
            </p>
          </div>

          <form action={createAction} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="create-displayName"
                className="block text-sm font-medium text-[var(--ink)]"
              >
                Your name
              </label>
              <input
                id="create-displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                placeholder="What should we call you?"
                className="
                  w-full rounded-lg border border-[var(--foreground)]/30 bg-[var(--background)]/60
                  px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--foreground)]/50
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
                  transition-shadow
                "
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="create-petName"
                className="block text-sm font-medium text-[var(--ink)]"
              >
                Your pet&apos;s name
              </label>
              <input
                id="create-petName"
                name="petName"
                type="text"
                autoComplete="off"
                required
                placeholder="What's your pet's name?"
                className="
                  w-full rounded-lg border border-[var(--foreground)]/30 bg-[var(--background)]/60
                  px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--foreground)]/50
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
                  transition-shadow
                "
              />
            </div>

            <PetTypeSelect />

            <div className="space-y-1">
              <label
                htmlFor="create-householdName"
                className="block text-sm font-medium text-[var(--ink)]"
              >
                Household name
              </label>
              <input
                id="create-householdName"
                name="householdName"
                type="text"
                autoComplete="off"
                required
                placeholder="e.g. The Smith House"
                className="
                  w-full rounded-lg border border-[var(--foreground)]/30 bg-[var(--background)]/60
                  px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--foreground)]/50
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
                  transition-shadow
                "
              />
            </div>

            <button
              type="submit"
              className="
                w-full rounded-lg bg-[var(--ink)] px-4 py-2.5
                text-sm font-medium text-[var(--background)]
                hover:opacity-90 active:opacity-80
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
                transition-opacity
              "
            >
              Create household
            </button>
          </form>
        </section>

        {/* Join with a code */}
        <section className="rounded-xl border border-[var(--foreground)]/20 bg-[var(--background)] p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-[family-name:var(--font-display)] font-semibold text-[var(--ink)]">
              Join with a code
            </h2>
            <p className="text-sm text-[var(--foreground)]">
              Someone shared an invite code with you.
            </p>
          </div>

          <JoinHouseholdForm />
        </section>
      </div>
    </main>
  );
}
