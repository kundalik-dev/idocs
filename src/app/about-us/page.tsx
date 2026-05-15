import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  BookOpen,
  Code2,
  FolderOpen,
  GitBranch,
  LockKeyhole,
  Server,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About mDocks",
  description:
    "Learn why mDocks exists and how it helps you read local Markdown files and GitHub repository documentation privately.",
  alternates: {
    canonical: "/about-us",
  },
};

const principles = [
  {
    icon: LockKeyhole,
    title: "Local-first",
    body: "mDocks is designed around files that already live on your machine. The reader avoids uploads and keeps document access close to your filesystem.",
  },
  {
    icon: FolderOpen,
    title: "Plain Markdown",
    body: "Your docs remain regular Markdown files. Keep using your editor, Git workflow, folders, and repositories as usual.",
  },
  {
    icon: Server,
    title: "Optional localhost server",
    body: "When browser APIs are not enough, the local server can clone GitHub repositories and expose them only to the viewer on 127.0.0.1.",
  },
];

const reasons = [
  {
    icon: FolderOpen,
    title: "Markdown libraries outgrow editors",
    body: "Editors are excellent for writing, but long docs, nested folders, and reference-heavy projects deserve a dedicated reading surface.",
  },
  {
    icon: Code2,
    title: "Technical docs need structure",
    body: "mDocks turns headings into a table of contents, highlights code blocks, and keeps frontmatter visible without changing the source file.",
  },
  {
    icon: GitBranch,
    title: "Repo docs should be easy to browse",
    body: "The optional local server lets you clone GitHub repositories and read their Markdown alongside your local folders.",
  },
];

export default function AboutUsPage() {
  return (
    <main className="flex-1">
      <section className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Button>
          <div className="mt-10 max-w-3xl">
            <div className="flex items-center gap-4">
              <div className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-foreground text-background md:size-12">
                <BookOpen className="size-5 md:size-6" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                About mDocks
              </h1>
            </div>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              mDocks is a private Markdown reader for people who keep important
              notes, project documentation, runbooks, and repository docs in
              plain text.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Why it exists
          </p>
          <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
            Markdown is simple. Reading a full docs library should be too.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            mDocks adds a focused reading layer around the Markdown files and
            repositories you already maintain.
          </p>
        </div>

        <div className="relative mt-14">
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 560"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-y-8 left-0 hidden h-[calc(100%-4rem)] w-full text-border md:block"
          >
            <path
              d="M500 34 C760 80 760 170 500 214 C240 258 240 346 500 390 C760 434 760 500 500 536"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="10 12"
            />
          </svg>

          <div className="space-y-10 md:space-y-14">
            {reasons.map(({ icon: Icon, title, body }, index) => {
              const isRight = index % 2 === 1;

              return (
                <div
                  key={title}
                  className="relative grid items-center gap-5 md:grid-cols-[1fr_5rem_1fr]"
                >
                  <div className={isRight ? "hidden md:block" : ""}>
                    {!isRight && (
                      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
                            <Icon className="size-4" />
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Step {index + 1}
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold tracking-tight">
                          {title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {body}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="relative order-first flex items-center justify-start md:order-none md:justify-center">
                    <div className="absolute left-5 top-10 h-[calc(100%+2.5rem)] w-px bg-border md:hidden" />
                    <div className="relative z-10 grid size-11 place-items-center rounded-full border border-border bg-background shadow-sm">
                      <span className="grid size-8 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  <div className={!isRight ? "hidden md:block" : ""}>
                    {isRight && (
                      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
                            <Icon className="size-4" />
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Step {index + 1}
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold tracking-tight">
                          {title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {body}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {principles.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-background p-6">
              <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
                <Icon className="size-4" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
