"use client";

import { useEffect } from "react";
import { useViewerStore } from "@/store/viewer-store";

function isTextTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

/** Wires `s` (toggle sidebar), `a` (prev file), `d` (next file). */
export function useKeyboardShortcuts(): void {
  const toggleSidebar = useViewerStore((s) => s.toggleSidebar);
  const nextFile = useViewerStore((s) => s.nextFile);
  const prevFile = useViewerStore((s) => s.prevFile);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTextTarget(e.target)) return;
      const k = e.key.toLowerCase();
      if (k === "s") {
        e.preventDefault();
        toggleSidebar();
      } else if (k === "d") {
        e.preventDefault();
        nextFile();
      } else if (k === "a") {
        e.preventDefault();
        prevFile();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSidebar, nextFile, prevFile]);
}
