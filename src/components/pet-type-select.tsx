"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ANIMAL_TYPES } from "@/lib/animals";

export function PetTypeSelect() {
  const [value, setValue] = useState("dog");

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-[var(--ink)]">
        What kind of pet?
      </label>
      <Select name="petType" value={value} onValueChange={(v) => { if (v !== null) setValue(v); }}>
        <SelectTrigger className="w-full rounded-lg border border-[var(--foreground)]/30 bg-[var(--background)]/60 px-3 py-2 text-sm text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] h-auto">
          <SelectValue placeholder="Select animal type" />
        </SelectTrigger>
        <SelectContent>
          {ANIMAL_TYPES.map((a) => (
            <SelectItem key={a.key} value={a.key}>
              <span className="emoji">{a.emoji}</span> {a.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
