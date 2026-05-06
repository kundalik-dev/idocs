import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-grid place-items-center min-w-[1.25rem] h-5 px-1 rounded border border-border bg-muted text-[11px] font-mono text-muted-foreground",
        className
      )}
    >
      {children}
    </kbd>
  );
}

export function ShortcutHints() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <Kbd>S</Kbd> sidebar
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Kbd>W</Kbd> TOC
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Kbd>A</Kbd>
        <Kbd>D</Kbd> prev / next
      </span>
    </div>
  );
}
