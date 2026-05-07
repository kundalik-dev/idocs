import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Viewer",
  description:
    "Open and read local Markdown files privately in the iDocs browser viewer.",
  alternates: {
    canonical: "/viewer",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ViewerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
