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
              nativeButton={false}
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
              <div className="rounded-xl border border-border bg-muted/20 p-6 md:p-7 flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="size-10 shrink-0 rounded-lg bg-foreground text-background flex items-center justify-center">
                    <FolderOpen className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Browser files</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Open local Markdown without installing anything. Pick a
                      folder or a few files and start reading immediately.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/70 p-3 shadow-sm">
                  <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Quick flow
                  </p>
                  <div className="divide-y divide-border rounded-lg border border-border bg-background">
                    {[
                      {
                        step: "01",
                        title: "Open mDocs",
                        body: "Launch the reader in your browser.",
                      },
                      {
                        step: "02",
                        title: "Pick files or folder",
                        body: "Choose Markdown from your local machine.",
                      },
                      {
                        step: "03",
                        title: "Read and refresh",
                        body: "Browse the tree, use the TOC, and see edits reload.",
                      },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-3 p-3">
                        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">
                          {item.step}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                            {item.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto space-y-4">
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/viewer" />}
                    className="w-full"
                  >
                    Open viewer
                    <ArrowRight className="size-3.5" />
                  </Button>
                  <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      No installation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Live reload
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Local file handles
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Chromium only
                    </li>
                  </ul>
                </div>
              </div>

              {/* Local server */}
              <div className="rounded-xl border border-border bg-muted/20 p-6 md:p-7 flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="size-10 shrink-0 rounded-lg bg-foreground text-background flex items-center justify-center">
                    <Terminal className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      Local server + GitHub repos
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Run the mDocs server locally, then clone public GitHub
                      repos from the viewer. It binds to{" "}
                      <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted border border-border">
                        127.0.0.1:4873
                      </code>{" "}
                      so docs stay on your machine.
                    </p>
                  </div>
                </div>
                <div className="mt-auto space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Start the server
                  </p>
                  <div className="rounded-xl border border-border bg-background/70 p-2.5 shadow-sm">
                    <p className="px-1 pb-2 text-[11px] font-medium text-muted-foreground">
                      Install once, then start with the short command.
                    </p>
                    <CopyCommand
                      label="Install global"
                      command="npm install -g mdocs"
                      className="w-full"
                    />
                    <CopyCommand
                      label="Start server"
                      command="mdocs start"
                      className="mt-2 w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Prefer no install?
                    </p>
                    <CopyCommand
                      label="No install"
                      command="npx mdocs serve"
                      className="w-full"
                    />
                  </div>
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
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-14">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div className="max-w-md">
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-semibold tracking-tight"
              >
                <span className="inline-grid size-6 shrink-0 rounded-md bg-foreground text-background place-items-center text-xs font-bold">
                  m
                </span>
                <span>mDocs</span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                A local-first Markdown reader for folders, files, and cloned
                GitHub repository docs. Read comfortably without moving private
                documents into a hosted service.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold">Product</h2>
              <nav className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/viewer" className="hover:text-foreground">
                  Open mDocs
                </Link>
                <Link
                  href="/viewer?demo=mdocs-info"
                  className="hover:text-foreground"
                >
                  Demo guide
                </Link>
                <a href="/docs/mdocs-info.md" className="hover:text-foreground">
                  Raw Markdown demo
                </a>
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
        </div>
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
