export type BlogPostManifestItem = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  author?: string;
  file: string;
};

function timestamp(date: string): number {
  const value = new Date(date).getTime();
  return Number.isNaN(value) ? 0 : value;
}

export function sortBlogPostsNewestFirst(
  posts: BlogPostManifestItem[],
): BlogPostManifestItem[] {
  return [...posts].sort((a, b) => {
    const byDate = timestamp(b.date) - timestamp(a.date);
    return byDate === 0 ? a.title.localeCompare(b.title) : byDate;
  });
}

export function isBlogPostManifestItem(
  value: unknown,
): value is BlogPostManifestItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.slug === "string" &&
    typeof item.title === "string" &&
    typeof item.description === "string" &&
    typeof item.date === "string" &&
    typeof item.file === "string" &&
    (item.tags === undefined ||
      (Array.isArray(item.tags) &&
        item.tags.every((tag) => typeof tag === "string"))) &&
    (item.author === undefined || typeof item.author === "string")
  );
}

export function normalizeBlogManifest(
  value: unknown,
): BlogPostManifestItem[] {
  if (!Array.isArray(value)) return [];
  return sortBlogPostsNewestFirst(value.filter(isBlogPostManifestItem));
}
