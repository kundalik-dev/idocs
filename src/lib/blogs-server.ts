import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import {
  normalizeBlogManifest,
  type BlogPostManifestItem,
} from "@/lib/blogs";
import { parseMarkdown } from "@/lib/markdown";

export type BlogPost = BlogPostManifestItem & {
  content: string;
  frontmatter: Record<string, unknown>;
};

const BLOGS_DIR = path.join(process.cwd(), "public", "blogs");

export const getBlogPosts = cache(async (): Promise<BlogPostManifestItem[]> => {
  try {
    const file = await readFile(path.join(BLOGS_DIR, "index.json"), "utf8");
    return normalizeBlogManifest(JSON.parse(file));
  } catch {
    return [];
  }
});

export const getBlogPost = cache(
  async (slug: string): Promise<BlogPost | null> => {
    const posts = await getBlogPosts();
    const post = posts.find((item) => item.slug === slug);
    if (!post) return null;

    const filename = path.basename(post.file);
    const raw = await readFile(path.join(BLOGS_DIR, filename), "utf8");
    const parsed = parseMarkdown(raw);

    return {
      ...post,
      content: parsed.content,
      frontmatter: parsed.frontmatter,
    };
  },
);
