import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : new URL("http://localhost:3000");

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "iDocs",
  title: {
    default: "iDocs - Local Markdown Reader",
    template: "%s | iDocs",
  },
  description:
    "iDocs is a private, local-first Markdown reader for opening folders and files directly in your browser with a polished reading view, table of contents, and syntax highlighting.",
  keywords: [
    "Markdown reader",
    "local Markdown viewer",
    "offline Markdown reader",
    "private document reader",
    "MD file viewer",
    "Next.js Markdown app",
  ],
  authors: [{ name: "iDocs" }],
  creator: "iDocs",
  publisher: "iDocs",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "iDocs",
    title: "iDocs - Local Markdown Reader",
    description:
      "Open Markdown files from your machine and read them in a clean, private, local-first viewer.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "iDocs local Markdown reader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iDocs - Local Markdown Reader",
    description:
      "A private, local-first Markdown reader for folders and files on your machine.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        inter.variable,
        geistMono.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider delay={150}>{children}</TooltipProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
