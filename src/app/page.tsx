import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FolderOpen,
  Keyboard,
  RefreshCw,
  Sparkles,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: FolderOpen,
    title: "Open anything",
    body: "Pick a folder or individual files. Mix sources freely — every .md gets a home in the sidebar.",
  },
  {
    icon: BookOpen,
    title: "Read like Medium",
    body: "Inter for body, serif blockquotes, generous line height. Frontmatter renders as a clean metadata card.",
  },
  {
    icon: Sparkles,
    title: "Shiki-powered code",
    body: "VS Code-grade syntax highlighting with one-click copy. Light and dark themes baked in.",
  },
  {
    icon: Keyboard,
    title: "Keyboard first",
    body: "s toggles the sidebar, a / d move between files. Stay on the home row, stay in flow.",
  },
  {
    icon: RefreshCw,
    title: "Live reload",
    body: "Edits in your editor show up here within seconds. Or hit the refresh dot when you can't wait.",
  },
  {
    icon: Sun,
    title: "Light by default",
    body: "Crisp light theme out of the box. Flip to dark with one click in the corner.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-grid size-6 shrink-0 rounded-md bg-foreground text-background place-items-center text-xs font-bold">i</span>
            <span>iDocs</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="default" size="sm" render={<Link href="/viewer" />}>
              Open viewer
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Local-first · No upload · Works offline
            </span>
            <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Your markdown library,
              <br />
              <span className="text-muted-foreground">read beautifully.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              iDocs opens <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-muted border border-border">.md</code>{" "}
              files straight from your machine. Pick a folder, pick a file, then read with serif blockquotes,
              syntax-highlighted code, and a table of contents that follows you down the page.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button size="lg" render={<Link href="/viewer" />}>
                Open the viewer
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" render={<a href="/docs/PROGRESS.md" target="_blank" rel="noreferrer" />}>
                Peek at the demo doc
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Requires a Chromium-based browser (Chrome, Edge, Brave, Arc) for File System Access.
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px rounded-xl overflow-hidden border border-border bg-border">
              {features.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-background p-6 md:p-7">
                  <div className="size-9 shrink-0 rounded-lg bg-foreground text-background flex items-center justify-center mb-4">
                    <Icon className="size-4" />
                  </div>
                  <h3 className="font-semibold text-base">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Nothing leaves your machine.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            iDocs reads files via the File System Access API — your documents are never uploaded
            anywhere. The handles you grant are remembered locally so you don&apos;t have to re-pick
            on every visit.
          </p>
          <div className="mt-8">
            <Button size="lg" render={<Link href="/viewer" />}>
              Open the viewer
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-muted-foreground flex items-center justify-between">
          <span>iDocs</span>
          <span>Built with Next.js · React · Tailwind · shadcn/ui</span>
        </div>
      </footer>
    </div>
  );
}
