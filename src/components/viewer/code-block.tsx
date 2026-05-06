"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { Button } from "@/components/ui/button";

type Props = {
  code: string;
  lang?: string;
};

const SHIKI_OPTS = {
  themes: { light: "github-light", dark: "github-dark" } as const,
  defaultColor: false as const,
};

const KNOWN_LANG_ALIAS: Record<string, string> = {
  shell: "bash",
  sh: "bash",
  text: "plaintext",
  txt: "plaintext",
  jsonc: "json",
};

export function CodeBlock({ code, lang }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const display = (lang ?? "text").toLowerCase();
  const shikiLang = KNOWN_LANG_ALIAS[display] ?? display;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const out = await codeToHtml(code, { lang: shikiLang, ...SHIKI_OPTS });
        if (alive) setHtml(out);
      } catch {
        // Unknown language — fall back to plaintext.
        try {
          const out = await codeToHtml(code, {
            lang: "plaintext",
            ...SHIKI_OPTS,
          });
          if (alive) setHtml(out);
        } catch {
          if (alive) setHtml(`<pre><code>${escapeHtml(code)}</code></pre>`);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [code, shikiLang]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  }

  return (
    <div className="code-block-wrapper not-prose">
      <div className="code-block-toolbar">
        <span className="code-block-lang">{display === "text" ? "" : display}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        </Button>
      </div>
      {html ? (
        <div
          className="shiki-html"
          // Shiki returns trusted HTML based on our own input; safe to inject.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="text-muted-foreground/70">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
