"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/markdown";
import { useViewerStore } from "@/store/viewer-store";

type Props = {
  items: TocItem[];
};

/**
 * Right-rail TOC with active section highlight via IntersectionObserver.
 * Returns null when there are no headings — caller decides not to render.
 */
export function Toc({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const setTocOpen = useViewerStore((s) => s.setTocOpen);

  const handleTocItemClick = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setTocOpen(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        // Pick the first visible heading in document order.
        const firstVisible = items.find((it) => visible.has(it.id));
        if (firstVisible) setActiveId(firstVisible.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 1] }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  // Normalize so the smallest level used in the doc becomes indent 0.
  const minLevel = Math.min(...items.map((i) => i.level));

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-3">
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-border">
        {items.map((it) => {
          const indent = it.level - minLevel;
          const isActive = it.id === activeId;
          return (
            <li key={it.id} style={{ paddingLeft: `${0.75 + indent * 0.875}rem` }}>
              <a
                href={`#${it.id}`}
                onClick={handleTocItemClick}
                className={cn(
                  "block -ml-px border-l-2 border-transparent py-0.5 pl-3 transition-colors",
                  "text-muted-foreground hover:text-foreground",
                  isActive && "border-foreground text-foreground font-medium"
                )}
              >
                {it.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
