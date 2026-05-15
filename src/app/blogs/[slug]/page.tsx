import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CalendarDays, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MarkdownView } from "@/components/viewer/markdown-view";
import { cn } from "@/lib/utils";
import { getBlogPost, getBlogPosts } from "@/lib/blogs-server";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
).origin;

type Props = {
  params: Promise<{ slug: string }>;
};

function formatDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Blog post not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const url = `/blogs/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      siteName: "mDocks",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: post.author ? [post.author] : ["mDocks"],
      tags: post.tags,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${post.title} - mDocks`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) notFound();

  const articleUrl = `${siteUrl}/blogs/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author ?? "mDocks",
    },
    publisher: {
      "@type": "Organization",
      name: "mDocks",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    url: articleUrl,
    keywords: post.tags?.join(", "),
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto w-full max-w-4xl px-6 py-12 md:py-16">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Blog
        </Link>

        <header className="mt-8 border-b border-border pb-8">
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {post.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </span>
            {post.tags?.length ? (
              <span className="inline-flex items-center gap-1.5">
                <Tag className="size-3.5" />
                <span className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </span>
              </span>
            ) : null}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/viewer?blog=${post.slug}`}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Open in mDocks viewer
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/viewer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Open app
            </Link>
          </div>
        </header>

        <div className="pt-8">
          <MarkdownView source={post.content} />
        </div>
      </article>
    </main>
  );
}
