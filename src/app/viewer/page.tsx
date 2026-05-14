"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { FilePicker } from "@/components/viewer/file-picker";
import { FileTree } from "@/components/viewer/file-tree";
import { ServerPanel } from "@/components/viewer/server-panel";
import { SourceSwitcher } from "@/components/viewer/source-switcher";
import { MarkdownView } from "@/components/viewer/markdown-view";
import { MetadataCard } from "@/components/viewer/metadata-card";
import { Toc } from "@/components/viewer/toc";
import { ShortcutHints } from "@/components/viewer/shortcut-hint";
import { selectActiveFile, useViewerStore } from "@/store/viewer-store";
import { useFileContent } from "@/hooks/use-file-content";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { extractToc, parseMarkdown } from "@/lib/markdown";

export default function ViewerPage() {
  return (
    <Suspense fallback={<LoadingDoc />}>
      <ViewerPageContent />
    </Suspense>
  );
}

function ViewerPageContent() {
  const searchParams = useSearchParams();
  const sidebarOpen = useViewerStore((s) => s.sidebarOpen);
  const tocOpen = useViewerStore((s) => s.tocOpen);
  const toggleSidebar = useViewerStore((s) => s.toggleSidebar);
  const toggleToc = useViewerStore((s) => s.toggleToc);
  const hydrate = useViewerStore((s) => s.hydrate);
  const hydrated = useViewerStore((s) => s.hydrated);
  const openDemoDoc = useViewerStore((s) => s.openDemoDoc);
  const activeFile = useViewerStore(selectActiveFile);
  const sources = useViewerStore((s) => s.sources);
  const hasSources = sources.length > 0;

  useKeyboardShortcuts();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const demo = searchParams.get("demo");
    if (demo) openDemoDoc(demo);
  }, [hydrated, openDemoDoc, searchParams]);

  const { text, loading, error, lastModified, reload } =
    useFileContent(activeFile);

  const parsed = useMemo(() => (text ? parseMarkdown(text) : null), [text]);
  const toc = useMemo(
    () => (parsed ? extractToc(parsed.content) : []),
    [parsed],
  );
  const tocVisible = tocOpen && parsed && toc.length > 0;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background">
      {/* ---- Header ---- */}
      <header className="h-14 shrink-0 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-3 gap-2 z-30">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSidebar}
                aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              />
            }
          >
            {sidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </TooltipTrigger>
          <TooltipContent>
            Toggle sidebar{" "}
            <kbd className="ml-1 font-mono text-[10px] opacity-80">S</kbd>
          </TooltipContent>
        </Tooltip>

        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-sm hover:text-foreground/80 transition-colors"
        >
          <ArrowLeft className="size-3.5 text-muted-foreground" />
          <span className="inline-grid size-5 shrink-0 rounded bg-foreground text-background place-items-center text-[10px] font-bold">
            i
          </span>
          <span>iDocs</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground ml-2 min-w-0 flex-1">
          {activeFile ? (
            <>
              <span className="opacity-50">/</span>
              <span className="truncate">{activeFile.relPath}</span>
            </>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <ShortcutHints />
          </div>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleToc}
                  aria-label={
                    tocOpen
                      ? "Hide table of contents"
                      : "Show table of contents"
                  }
                />
              }
            >
              {tocOpen ? (
                <PanelRightClose className="size-4" />
              ) : (
                <PanelRightOpen className="size-4" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              Toggle TOC{" "}
              <kbd className="ml-1 font-mono text-[10px] opacity-80">W</kbd>
            </TooltipContent>
          </Tooltip>
          <ThemeToggle />
        </div>
      </header>

      {/* ---- Body ---- */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className={cn(
            "shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
            "transition-[width] duration-200 ease-out",
            sidebarOpen ? "w-72" : "w-0",
            "overflow-hidden",
          )}
        >
          <div className="w-72 h-full min-h-0 flex flex-col">
            {/* Project switcher */}
            <div className="shrink-0 border-b border-sidebar-border">
              {hasSources ? (
                <SourceSwitcher />
              ) : (
                <div className="px-3 py-3">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
                    Library
                  </span>
                </div>
              )}
            </div>
            <ScrollArea className="min-h-0 flex-1 overflow-hidden thin-scrollbar">
              {!hydrated ? (
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ) : hasSources ? (
                <FileTree />
              ) : (
                <div className="p-6">
                  <FilePicker />
                </div>
              )}
            </ScrollArea>
            <ServerPanel />
          </div>
        </aside>

        {/* Main + TOC */}
        <main className="flex-1 min-w-0 flex">
          <div className="flex-1 min-w-0 overflow-y-auto thin-scrollbar">
            <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 md:px-10 lg:px-14 py-10 md:py-16">
              {!activeFile ? (
                <EmptyState hydrated={hydrated} hasSources={hasSources} />
              ) : loading && text === null ? (
                <LoadingDoc />
              ) : error ? (
                <ErrorState message={error.message} onRetry={reload} />
              ) : parsed ? (
                <>
                  <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
                    <RefreshDot
                      lastModified={lastModified}
                      onClick={reload}
                      loading={loading}
                    />
                  </div>
                  <MetadataCard
                    frontmatter={parsed.frontmatter}
                    fallbackTitle={
                      activeFile.name.replace(/\.(md|markdown|mdx)$/i, "") ||
                      activeFile.name
                    }
                  />
                  <MarkdownView source={parsed.content} />
                </>
              ) : null}
            </div>
          </div>

          {/* Right TOC rail (only when content + headings) */}
          <aside
            aria-hidden={!tocVisible}
            className={cn(
              "hidden xl:flex xl:flex-col shrink-0 overflow-x-hidden overflow-y-auto border-l thin-scrollbar",
              "transition-[width,border-color] duration-200 ease-out",
              tocVisible ? "w-64 border-border" : "w-0 border-transparent",
            )}
          >
            <div
              className={cn(
                "w-64 p-6 transition-[opacity,transform] duration-200 ease-out",
                tocVisible
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-4 opacity-0",
              )}
            >
              {parsed && toc.length > 0 ? <Toc items={toc} /> : null}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

function toRelativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ts).toLocaleDateString();
}

function RefreshDot({
  lastModified,
  onClick,
  loading,
}: {
  lastModified: number | null;
  onClick: () => void;
  loading: boolean;
}) {
  // Tick every 15s so relative time re-derives during render.
  const [, tick] = useState(0);
  useEffect(() => {
    if (!lastModified) return;
    const id = setInterval(() => tick((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, [lastModified]);

  const relTime = lastModified ? toRelativeTime(lastModified) : "—";

  const exact = lastModified
    ? new Date(lastModified).toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon-xs"
              onClick={onClick}
              aria-label="Reload file"
              className="rounded-full"
            />
          }
        >
          <RefreshCw className={cn("size-3", loading && "animate-spin")} />
        </TooltipTrigger>
        <TooltipContent>Reload</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<span className="opacity-70 cursor-default" />}>
          Last read {relTime}
        </TooltipTrigger>
        <TooltipContent>{exact ?? "—"}</TooltipContent>
      </Tooltip>
    </div>
  );
}

function LoadingDoc() {
  return (
    <div className="space-y-5 animate-pulse">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <div className="h-px bg-border my-8" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-10/12" />
      <Skeleton className="h-32 w-full mt-6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-9/12" />
    </div>
  );
}

function EmptyState({
  hydrated,
  hasSources,
}: {
  hydrated: boolean;
  hasSources: boolean;
}) {
  if (!hydrated) return <LoadingDoc />;
  return (
    <div className="min-h-[60vh] grid place-items-center text-center">
      <div className="max-w-md">
        {hasSources ? (
          <>
            <h2 className="text-2xl font-semibold tracking-tight">
              Pick a file from the sidebar
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Press{" "}
              <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted border border-border">
                d
              </kbd>{" "}
              to jump to the next file or
              <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted border border-border ml-1">
                a
              </kbd>{" "}
              for the previous.
            </p>
          </>
        ) : (
          <FilePicker />
        )}
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
      <h2 className="text-lg font-semibold text-destructive">
        Couldn&apos;t read this file
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        <RefreshCw className="size-3.5" /> Try again
      </Button>
    </div>
  );
}
