import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  FolderOpen,
  GitBranch,
  Globe,
  Keyboard,
  LayoutList,
  RefreshCw,
  Sparkles,
  Sun,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CopyCommand } from "@/components/copy-command";

export const metadata: Metadata = {
  title: "mDocs — Local Markdown Reader",
  description:
    "Read local Markdown files and browse cloned GitHub repos in a private, local-first browser app. Folder support, table of contents, syntax highlighting, and offline-friendly document access.",
  alternates: {
    canonical: "/",
  },
};

const features = [
  {
    icon: FolderOpen,
    title: "Open anything",
    body: "Pick a folder or individual files directly from your machine. Mix browser sources and cloned repos side by side.",
  },
  {
    icon: GitBranch,
    title: "Clone GitHub repos",
    body: "Run the local server, paste a GitHub URL, and browse any public repo's docs without leaving the viewer.",
  },
  {
    icon: LayoutList,
    title: "Project switcher",
    body: "Switch between multiple open folders and repos in one click. Each project shows only its own file tree.",
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
    body: "Edits in your editor appear within seconds for local files. Hit the refresh dot when you can't wait.",
  },
  {
    icon: BookOpen,
    title: "Read like Medium",
    body: "Generous line height, serif blockquotes, and frontmatter rendered as a clean metadata card.",
  },
  {
    icon: Sun,
    title: "Light by default",
    body: "Crisp light theme out of the box. Flip to dark with one click. Preference is remembered.",
  },
  {
    icon: Globe,
    title: "Fully offline",
    body: "Documents never leave your machine. No uploads, no tracking, no account required.",
  },
];

export default function Home() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "mDocs",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    description:
      "A private, local-first Markdown reader that opens folders and files from your computer and browses cloned GitHub repos via a local server.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Open local Markdown folders and files",
      "Clone and browse GitHub repositories",
      "Project switcher for multiple sources",
      "Render GitHub-flavored Markdown",
      "Generate a table of contents from headings",
      "Highlight code blocks",
      "Store file handles locally in the browser",
      "Support light and dark themes",
    ],
  };

  return (
    <div className="flex flex-col flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="inline-grid size-6 shrink-0 rounded-md bg-foreground text-background place-items-center text-xs font-bold">
              m
            </span>
            <span>mDocs</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="default"
              size="sm"
              render={<Link href="/viewer" />}
            >
              Open mDocs
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Local-first &middot; No upload &middot; Works offline
            </span>
            <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Your markdown viewer,
              <br />
              <span className="text-muted-foreground">read beautifully.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              mDocs open folders, individual{" "}
              <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-muted border border-border">
                .md
              </code>{" "}
              or cloned GitHub repos in a private reader with syntax
              highlighting, live reload, and a table of contents.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/viewer" />}
              >
                Open mDocs
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/viewer?demo=mdocs-info" />}
              >
                View demo in mDocs
                <BookOpen className="size-4" />
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Local file picking requires a Chromium browser (Chrome, Edge,
              Brave, Arc).
            </p>
          </div>
        </section>

        {/* ── Two modes ── */}
        <section className="border-t border-border">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-10">
              Two ways to open docs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Browser files */}
              <div className="rounded-xl border border-border bg-muted/20 p-7 flex flex-col gap-4">
                <div className="size-10 rounded-lg bg-foreground text-background flex items-center justify-center">
                  <FolderOpen className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Browser files</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Use the File System Access API to open a local folder or
                    pick individual files. No install required — just click{" "}
                    <strong>Open viewer</strong> above and pick your folder.
                  </p>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1.5 mt-auto">
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                    No installation needed
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                    Live-reloads on file save
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                    Chromium browsers only
                  </li>
                </ul>
              </div>

              {/* Local server */}
              <div className="rounded-xl border border-border bg-muted/20 p-7 flex flex-col gap-4">
                <div className="size-10 rounded-lg bg-foreground text-background flex items-center justify-center">
                  <Terminal className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Local server + GitHub repos
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Run the mDocs server locally, then clone any public GitHub
                    repo straight from the viewer. The server lives at{" "}
                    <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted border border-border">
                      127.0.0.1:4873
                    </code>{" "}
                    — your docs never leave your machine.
                  </p>
                </div>
                <div className="mt-auto space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Start the server
                  </p>
                  <CopyCommand command="npx mdocs serve" />
                  <ul className="text-sm text-muted-foreground space-y-1.5 pt-1">
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Clone any public GitHub repo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Works in any modern browser
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Private repos via{" "}
                      <code className="font-mono text-xs">GITHUB_TOKEN</code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features grid ── */}
        <section className="border-t border-border bg-muted/20">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-10">
              Everything you need to read docs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px rounded-xl overflow-hidden border border-border bg-border">
              {features.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-background p-6 md:p-7">
                  <div className="size-9 shrink-0 rounded-lg bg-foreground text-background flex items-center justify-center mb-4">
                    <Icon className="size-4" />
                  </div>
                  <h3 className="font-semibold text-base">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Privacy CTA ── */}
        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Nothing leaves your machine.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            mDocs reads files via the File System Access API and a local server
            that binds to{" "}
            <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-muted border border-border">
              127.0.0.1
            </code>{" "}
            only. Your documents are never uploaded anywhere. File handles are
            remembered locally so you don&apos;t have to re-pick on every visit.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/viewer" />}
            >
              Open mDocs
              <ArrowRight className="size-4" />
            </Button>
            <CopyCommand command="npx mdocs serve" />
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-muted-foreground flex items-center justify-between">
          <span>mDocs</span>
          <span>
            Built with Next.js &middot; React &middot; Tailwind &middot;
            shadcn/ui
          </span>
        </div>
      </footer>
    </div>
  );
}
