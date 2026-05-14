import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Database, FileLock2, Server } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for mDocs, a local-first Markdown reader for browser files and localhost GitHub repository browsing.",
};

export default function PrivacyPolicyPage() {
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
                <FileLock2 className="size-5 md:size-6" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Privacy Policy
              </h1>
            </div>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              mDocs is built as a local-first reader. This page explains what
              stays on your machine and what the app stores locally.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: May 14, 2026
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14 md:py-16">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          <div className="bg-background p-6">
            <FileLock2 className="size-5 text-muted-foreground" />
            <h2 className="mt-4 font-semibold">No document uploads</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Files opened through the browser are read on your device. mDocs
              does not upload selected documents to an external service.
            </p>
          </div>
          <div className="bg-background p-6">
            <Database className="size-5 text-muted-foreground" />
            <h2 className="mt-4 font-semibold">Local browser storage</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The app may store file handles, source lists, the active file,
              theme preference, and layout preferences in your browser.
            </p>
          </div>
          <div className="bg-background p-6">
            <Server className="size-5 text-muted-foreground" />
            <h2 className="mt-4 font-semibold">Local server mode</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The optional server runs on `127.0.0.1` and is used to clone and
              read GitHub repositories locally.
            </p>
          </div>
        </div>

        <div className="mt-12 max-w-3xl space-y-8">
          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Information mDocs handles
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              mDocs handles Markdown file content only so it can render the
              document in the viewer. When you choose folders or files, browser
              permissions control access. When you use local server mode, the
              server reads cloned repository files from your machine.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              What is stored locally
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              mDocs uses local browser storage for remembered sources, the last
              active file, sidebar and table-of-contents settings, and the last
              local server URL. Clearing browser storage removes this data.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Network access
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Browser-file mode does not need a remote service. Local server
              mode may contact GitHub when you ask it to clone or sync a
              repository. Repository content is then read from the local clone.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
