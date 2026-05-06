"use client";

import { Calendar, Tag, User } from "lucide-react";
import type { Frontmatter } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";

type Props = {
  frontmatter: Frontmatter;
  fallbackTitle: string;
};

function asString(v: unknown): string | null {
  if (typeof v === "string" && v.trim().length > 0) return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString();
  return null;
}

function asStringArray(v: unknown): string[] | null {
  if (Array.isArray(v)) {
    const arr = v.map((x) => asString(x)).filter((s): s is string => !!s);
    return arr.length ? arr : null;
  }
  if (typeof v === "string") {
    const arr = v.split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length ? arr : null;
  }
  return null;
}

function formatDate(raw: string | null): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const PRIMARY_KEYS = new Set([
  "title",
  "description",
  "summary",
  "author",
  "date",
  "published",
  "publishedAt",
  "updated",
  "updatedAt",
  "tags",
  "categories",
  "draft",
]);

export function MetadataCard({ frontmatter, fallbackTitle }: Props) {
  const fm = frontmatter ?? {};
  const title = asString(fm.title) ?? fallbackTitle;
  const description = asString(fm.description) ?? asString(fm.summary);
  const author = asString(fm.author);
  const date =
    asString(fm.date) ??
    asString(fm.published) ??
    asString(fm.publishedAt) ??
    asString(fm.updated) ??
    asString(fm.updatedAt);
  const tags = asStringArray(fm.tags) ?? asStringArray(fm.categories);
  const draft = fm.draft === true || fm.draft === "true";

  const extras = Object.entries(fm)
    .filter(([k]) => !PRIMARY_KEYS.has(k))
    .map(([k, v]) => [k, asString(v)] as const)
    .filter((entry): entry is readonly [string, string] => entry[1] !== null);

  const hasMeta =
    description || author || date || (tags && tags.length) || draft || extras.length;

  return (
    <header className="mb-10">
      <h1 className="font-sans text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
          {description}
        </p>
      ) : null}

      {hasMeta ? (
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {author ? (
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5" />
              {author}
            </span>
          ) : null}
          {date ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <time dateTime={date}>{formatDate(date)}</time>
            </span>
          ) : null}
          {draft ? (
            <Badge variant="secondary" className="uppercase tracking-wide">
              Draft
            </Badge>
          ) : null}
          {tags && tags.length ? (
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              <Tag className="size-3.5" />
              <span className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </span>
            </span>
          ) : null}
          {extras.length ? (
            <span className="inline-flex items-center gap-3 text-xs text-muted-foreground/80">
              {extras.map(([k, v]) => (
                <span key={k} className="inline-flex items-center gap-1">
                  <span className="font-medium uppercase tracking-wider">{k}</span>
                  <span className="opacity-80">{v}</span>
                </span>
              ))}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 h-px bg-border" />
    </header>
  );
}
