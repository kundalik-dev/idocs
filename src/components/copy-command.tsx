"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyCommand({
  command,
  label,
  className,
}: {
  command: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — silently ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : `Copy ${command}`}
      className={cn(
        "max-w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2.5 text-left shadow-sm transition-colors",
        label
          ? "flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:gap-3"
          : "inline-flex items-center gap-2",
        "hover:border-foreground/25 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        copied && "border-emerald-500/40 bg-emerald-500/10",
        className
      )}
    >
      {label ? (
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:min-w-24">
          {label}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <code className="min-w-0 flex-1 select-all break-words font-mono text-sm text-foreground sm:whitespace-nowrap">
          {command}
        </code>
        <span
          className={cn(
            "shrink-0 rounded-md p-1 transition-colors",
            copied ? "text-emerald-500" : "text-muted-foreground"
          )}
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </span>
      </span>
    </button>
  );
}
