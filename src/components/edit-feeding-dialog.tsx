"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { editFeeding, deleteFeeding } from "@/actions/feedings";

interface Member {
  id: string;
  displayName: string;
}

interface EditFeedingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeding: {
    id: string;
    fedById: string | null;
    fedAt: Date;
  };
  members: Member[];
}

export function EditFeedingDialog({
  open,
  onOpenChange,
  feeding,
  members,
}: EditFeedingDialogProps) {
  const router = useRouter();

  const [selectedMemberId, setSelectedMemberId] = React.useState<string>(
    feeding.fedById ?? ""
  );
  const [manualDateTime, setManualDateTime] = React.useState<string>(
    toDatetimeLocalString(feeding.fedAt)
  );
  const [pending, setPending] = React.useState(false);

  // Reset state when dialog opens for a new feeding
  React.useEffect(() => {
    if (open) {
      setSelectedMemberId(feeding.fedById ?? "");
      setManualDateTime(toDatetimeLocalString(feeding.fedAt));
    }
  }, [open, feeding.fedById, feeding.fedAt]);

  async function handleSave() {
    setPending(true);
    try {
      await editFeeding({
        id: feeding.id,
        fedById: selectedMemberId === "" ? null : selectedMemberId,
        fedAt: new Date(manualDateTime),
      });
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this feeding?")) return;
    setPending(true);
    try {
      await deleteFeeding(feeding.id);
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  function applyQuickTime(minutesAgo: number) {
    const d = new Date(Date.now() - minutesAgo * 60 * 1000);
    setManualDateTime(toDatetimeLocalString(d));
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="bg-(--background) text-(--ink)">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="text-(--ink)">Edit Feeding</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Who fed */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="edit-fed-by"
              className="text-xs font-semibold font-mono uppercase tracking-wide text-(--foreground)"
            >
              Fed by
            </label>
            <select
              id="edit-fed-by"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="
                rounded-lg border border-(--foreground)/20 bg-(--background)
                px-3 py-2 text-sm text-(--ink)
                focus:outline-none focus:ring-2 focus:ring-(--accent)
              "
            >
              <option value="">Unknown</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Quick time buttons */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold font-mono uppercase tracking-wide text-(--foreground)">
              Time
            </span>
            <div className="flex gap-2">
              {[
                { label: "Just now", minutes: 0 },
                { label: "15 min ago", minutes: 15 },
                { label: "30 min ago", minutes: 30 },
              ].map(({ label, minutes }) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => applyQuickTime(minutes)}
                  className="
                    flex-1 rounded-lg px-2 py-1.5 text-xs font-medium
                    bg-(--foreground)/8 text-(--ink)
                    hover:bg-(--accent)/30 transition-colors
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
                  "
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Manual datetime picker */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="edit-fed-at"
              className="text-xs font-semibold font-mono uppercase tracking-wide text-(--foreground)"
            >
              Or pick a time
            </label>
            <input
              id="edit-fed-at"
              type="datetime-local"
              value={manualDateTime}
              onChange={(e) => setManualDateTime(e.target.value)}
              className="
                rounded-lg border border-(--foreground)/20 bg-(--background)
                px-3 py-2 text-sm text-(--ink)
                focus:outline-none focus:ring-2 focus:ring-(--accent)
              "
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="
                flex-1 rounded-lg px-4 py-2 text-sm font-semibold
                bg-(--accent) text-(--background)
                hover:opacity-90 transition-opacity
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
                disabled:opacity-50
              "
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="
                rounded-lg px-4 py-2 text-sm font-semibold
                bg-red-500/10 text-red-600
                hover:bg-red-500/20 transition-colors
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500
                disabled:opacity-50
              "
            >
              Delete
            </button>
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

/** Convert a Date to a datetime-local input string (YYYY-MM-DDTHH:mm) in local time */
function toDatetimeLocalString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
