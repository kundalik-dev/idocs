"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyCommand({ command }: { command: string }) {
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
    <div className="inline-flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2.5 font-mono text-sm">
      <span className="text-muted-foreground select-all">{command}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy command"}
        className={cn(
          "shrink-0 rounded-md p-1 transition-colors",
          copied
            ? "text-emerald-500"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}
