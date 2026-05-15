import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
).origin;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about-us", "/blogs", "/contact-us", "/privacy-policy"],
        disallow: ["/viewer", "/viewer/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
