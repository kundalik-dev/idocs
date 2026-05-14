import type { MetadataRoute } from "next";

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

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, ...route }) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    ...route,
  }));
}
