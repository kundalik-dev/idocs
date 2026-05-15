import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import Script from "next/script";

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
  applicationName: "mDocks",
  title: {
    default: "mDocks - Local Markdown Reader",
    template: "%s | mDocks",
  },
  description:
    "mDocks is a private, local-first Markdown reader for opening folders, files, and cloned GitHub repository docs in a polished browser viewer with table of contents and syntax highlighting.",
  keywords: [
    "Markdown reader",
    "local Markdown viewer",
    "offline Markdown reader",
    "private document reader",
    "GitHub repo browser",
    "local-first docs reader",
    "MD file viewer",
    "Next.js Markdown app",
  ],
  authors: [{ name: "mDocks" }],
  creator: "mDocks",
  publisher: "mDocks",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "mDocks",
    title: "mDocks - Local Markdown Reader",
    description:
      "Open local Markdown files and cloned GitHub repository docs in a clean, private, local-first viewer.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "mDocks local-first Markdown reader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mDocks - Local Markdown Reader",
    description:
      "A private, local-first Markdown reader for local files and GitHub repository docs.",
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
  verification: {
    other: {
      "msvalidate.01": "D66CD9963A001120C42B89E3C51B4D10",
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
        "font-sans",
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground"
      >
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="089db91d-ed81-4a11-88bd-7f0b4ee157b0"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2H442DGDH3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2H442DGDH3');
          `}
        </Script>
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
