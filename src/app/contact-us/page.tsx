import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, GitBranch, Mail, MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact mDocs",
  description:
    "Contact information for mDocs questions, feedback, issues, and product suggestions.",
  alternates: {
    canonical: "/contact-us",
  },
};

export default function ContactUsPage() {
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
                <MessageSquareText className="size-5 md:size-6" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Contact us
              </h1>
            </div>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Have feedback, a bug report, or a use case that mDocs should
              support better? Use the channels below.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14 md:py-16">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          <div className="bg-background p-6">
            <Mail className="size-5 text-muted-foreground" />
            <h2 className="mt-4 font-semibold">General questions</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Use email for product questions, private feedback, or longer
              notes about how you use Markdown.
            </p>
            <a
              className="mt-4 inline-flex text-sm font-medium text-foreground hover:underline"
              href="mailto:hello@mdocs.local"
            >
              hello@mdocs.local
            </a>
          </div>
          <div className="bg-background p-6">
            <GitBranch className="size-5 text-muted-foreground" />
            <h2 className="mt-4 font-semibold">Issues and ideas</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              For bugs, feature requests, and implementation details, a GitHub
              issue is usually the best place to keep context.
            </p>
            <span className="mt-4 inline-flex text-sm text-muted-foreground">
              Add your repository link here
            </span>
          </div>
          <div className="bg-background p-6">
            <MessageSquareText className="size-5 text-muted-foreground" />
            <h2 className="mt-4 font-semibold">What to include</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Share your browser, operating system, whether you used local files
              or the server, and the document type you were trying to read.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
