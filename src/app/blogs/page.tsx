import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CalendarDays, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getBlogPosts } from "@/lib/blogs-server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read mDocks blog posts about local-first Markdown, private docs, and GitHub repo documentation workflows.",
  alternates: {
    canonical: "/blogs",
  },
};

function formatDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function BlogsPage() {
  const posts = await getBlogPosts();

  return (
    <main className="flex-1">
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="inline-grid size-5 shrink-0 place-items-center rounded bg-foreground text-[10px] font-bold text-background">
                m
              </span>
              mDocks
            </Link>
            <h1 className="mt-8 text-4xl font-bold tracking-tight md:text-5xl">
              Blog
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Notes on local-first Markdown reading, private documentation, and
              browsing GitHub repo docs inside mDocks.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8">
            <h2 className="text-lg font-semibold">No blog posts yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add Markdown files to <code>public/blogs</code> and list them in{" "}
              <code>public/blogs/index.json</code>.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/25"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </span>
                  {post.tags?.length ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="size-3.5" />
                      {post.tags.slice(0, 2).join(", ")}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-4 text-xl font-semibold tracking-tight">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
                {post.tags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/blogs/${post.slug}`}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    Read article
                    <ArrowRight className="size-3.5" />
                  </Link>
                  <Link
                    href={`/viewer?blog=${post.slug}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                  >
                    Open in viewer
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:py-14">
          <div className="max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="inline-grid size-6 shrink-0 place-items-center rounded-md bg-foreground text-xs font-bold text-background">
                m
              </span>
              <span>mDocks</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A local-first Markdown reader for folders, files, blog posts, and
              cloned GitHub repository docs.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Product</h2>
            <nav className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/viewer" className="hover:text-foreground">
                Open mDocks
              </Link>
              <Link
                href="/viewer?blog=mdocks-info"
                className="hover:text-foreground"
              >
                Blog guide
              </Link>
              <Link href="/blogs/mdocks-info" className="hover:text-foreground">
                Demo guide
              </Link>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Company</h2>
            <nav className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/about-us" className="hover:text-foreground">
                About us
              </Link>
              <Link href="/contact-us" className="hover:text-foreground">
                Contact us
              </Link>
              <Link href="/privacy-policy" className="hover:text-foreground">
                Privacy policy
              </Link>
            </nav>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span>mDocks</span>
          <span>Built with Next.js, React, Tailwind, and shadcn/ui</span>
        </div>
      </footer>
    </main>
  );
}
