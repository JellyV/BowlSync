"use client";
import { useEffect } from "react";
export function ClearJustFed() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("justFed")) {
      url.searchParams.delete("justFed");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);
  return null;
}
