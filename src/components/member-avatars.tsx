import { Plus } from "lucide-react";
import { memberInitial } from "@/lib/initials";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  displayName: string;
}

/** Alternating fills so adjacent circles stay distinguishable. */
const FILLS = ["bg-(--ink)", "bg-(--foreground)"] as const;

export function AvatarCircle({
  name,
  index = 0,
  className,
}: {
  name: string;
  index?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-(--background) select-none",
        FILLS[index % FILLS.length],
        className
      )}
    >
      {memberInitial(name)}
    </span>
  );
}

/**
 * Overlapping initials stack with an optional dashed "+" circle — the
 * "add someone" affordance on the home page cluster that links to /household.
 */
export function MemberAvatars({
  members,
  withAdd = false,
}: {
  members: Member[];
  withAdd?: boolean;
}) {
  return (
    <span className="inline-flex items-center">
      <span className="sr-only">
        {members.length} {members.length === 1 ? "member" : "members"}
      </span>
      {members.map((m, i) => (
        <AvatarCircle
          key={m.id}
          name={m.displayName}
          index={i}
          className={cn("h-7 w-7 text-xs ring-2 ring-(--background)", i > 0 && "-ml-2")}
        />
      ))}
      {withAdd && (
        <span
          aria-hidden="true"
          className="
            -ml-2 flex h-7 w-7 items-center justify-center rounded-full
            border-2 border-dashed border-(--foreground)/70
            bg-(--background) text-(--foreground)
          "
        >
          <Plus className="h-3.5 w-3.5" />
        </span>
      )}
    </span>
  );
}
