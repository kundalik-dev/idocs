import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blogs-server";

export const dynamic = "force-static";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
).origin;

const lastModified = new Date("2026-05-14T00:00:00.000Z");

const routes = [
  {
    path: "/",
    changeFrequency: "weekly",
    priority: 1,
    images: [`${siteUrl}/opengraph-image`],
  },
  {
    path: "/about-us",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/blogs",
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    path: "/privacy-policy",
    changeFrequency: "yearly",
    priority: 0.5,
  },
  {
    path: "/contact-us",
    changeFrequency: "yearly",
    priority: 0.4,
  },
] satisfies Array<{
  path: string;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
  images?: string[];
}>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = routes.map(({ path, ...route }) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    ...route,
  }));

  const posts = await getBlogPosts();
  const blogRoutes = posts.map((post) => ({
    url: `${siteUrl}/blogs/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
