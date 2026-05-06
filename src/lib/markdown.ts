// Markdown parsing helpers: frontmatter extraction + TOC.

import matter from "gray-matter";
import GithubSlugger from "github-slugger";

export type Frontmatter = Record<string, unknown>;

export type ParsedDoc = {
  frontmatter: Frontmatter;
  content: string;
};

export type TocItem = {
  level: number; // 1..6
  text: string;
  id: string;
};

/**
 * Some Buffer polyfills are needed for gray-matter when imported in the browser.
 * gray-matter uses Buffer.isBuffer; we patch it lazily so the import remains cheap.
 */
function ensureBufferShim(): void {
  if (typeof globalThis === "undefined") return;
  const g = globalThis as { Buffer?: { isBuffer?: (v: unknown) => boolean } };
  if (!g.Buffer) {
    g.Buffer = { isBuffer: () => false };
  } else if (typeof g.Buffer.isBuffer !== "function") {
    g.Buffer.isBuffer = () => false;
  }
}

export function parseMarkdown(raw: string): ParsedDoc {
  ensureBufferShim();
  try {
    const { data, content } = matter(raw);
    return { frontmatter: (data ?? {}) as Frontmatter, content };
  } catch {
    return { frontmatter: {}, content: raw };
  }
}

/** Strip simple inline markdown so headings render plainly in the TOC. */
function plainText(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .trim();
}

/**
 * Extracts headings from markdown content (post-frontmatter), respecting code
 * fences. Slugs match `rehype-slug` (which uses github-slugger).
 */
export function extractToc(content: string): TocItem[] {
  const slugger = new GithubSlugger();
  const lines = content.split(/\r?\n/);
  const out: TocItem[] = [];
  let inFence = false;
  let fence: string | null = null;

  for (const raw of lines) {
    const line = raw.trimEnd();
    // Detect fence opening/closing — supports both ``` and ~~~ (and any length >=3).
    const fenceMatch = /^(\s*)(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[2];
      if (!inFence) {
        inFence = true;
        fence = marker[0];
      } else if (fence && marker.startsWith(fence)) {
        inFence = false;
        fence = null;
      }
      continue;
    }
    if (inFence) continue;

    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = plainText(heading[2]);
      if (!text) continue;
      out.push({ level, text, id: slugger.slug(text) });
    }
  }

  return out;
}

/** Friendly first sentence — used as a snippet when no description. */
export function firstParagraphSnippet(content: string, max = 180): string {
  const stripped = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/^#+\s+.*$/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim();
  const para = stripped.split(/\n\s*\n/).find((p) => p.trim().length > 0) ?? "";
  const oneLine = para.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) return oneLine;
  return oneLine.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}
