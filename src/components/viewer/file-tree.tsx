"use client";

import {
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  FileText,
  Files,
  Folder,
  FolderOpen,
  Globe,
  MoreHorizontal,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  selectActiveFile,
  useViewerStore,
  type LocalServerSource,
  type ViewerFile,
  type ViewerSource,
} from "@/store/viewer-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// ─── Collapse context ─────────────────────────────────────────────────────────
// gen increments on each "collapse/expand all" action; open is the target state.
// FolderItem watches gen via useEffect so nested folders all respond.

type CollapseSignal = { gen: number; open: boolean };
const CollapseContext = createContext<CollapseSignal>({ gen: 0, open: true });

// ─── Tree builder ─────────────────────────────────────────────────────────────

type FolderNode = {
  type: "folder";
  name: string;
  path: string;
  children: TreeNode[];
};
type FileNode = { type: "file"; file: ViewerFile };
type TreeNode = FolderNode | FileNode;

function buildTree(files: ViewerFile[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const f of files) {
    let level = root;
    let path = "";
    for (const seg of f.dirSegments) {
      path = path ? `${path}/${seg}` : seg;
      const existing = level.find(
        (n): n is FolderNode => n.type === "folder" && n.name === seg
      );
      if (existing) {
        level = existing.children;
      } else {
        const folder: FolderNode = { type: "folder", name: seg, path, children: [] };
        level.push(folder);
        level = folder.children;
      }
    }
    level.push({ type: "file", file: f });
  }

  const sortLevel = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      const an = a.type === "folder" ? a.name : a.file.name;
      const bn = b.type === "folder" ? b.name : b.file.name;
      return an.localeCompare(bn);
    });
    for (const n of nodes) if (n.type === "folder") sortLevel(n.children);
  };
  sortLevel(root);
  return root;
}

// ─── File item ────────────────────────────────────────────────────────────────

function FileItem({ file }: { file: ViewerFile }) {
  const active = useViewerStore((s) => selectActiveFile(s)?.id === file.id);
  const setActiveFile = useViewerStore((s) => s.setActiveFile);
  const display = file.name.replace(/\.(md|markdown|mdx)$/i, "");

  return (
    <button
      type="button"
      onClick={() => setActiveFile(file.id)}
      className={cn(
        "group/file flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-sm",
        "transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
      )}
      title={file.relPath}
    >
      <FileText
        className={cn(
          "size-3.5 shrink-0",
          active ? "text-foreground" : "text-muted-foreground/70"
        )}
      />
      <span className="truncate">{display}</span>
    </button>
  );
}

// ─── Folder item ──────────────────────────────────────────────────────────────

function FolderItem({ node }: { node: FolderNode }) {
  const [open, setOpen] = useState(true);
  const signal = useContext(CollapseContext);
  const prevGen = useRef(0);

  // Respond to collapse/expand-all signals without overriding individual toggles.
  useEffect(() => {
    if (signal.gen === 0) return;
    if (signal.gen !== prevGen.current) {
      prevGen.current = signal.gen;
      setOpen(signal.open);
    }
  }, [signal.gen, signal.open]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 w-full text-left px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight
          className={cn(
            "size-3 shrink-0 transition-transform duration-150",
            open && "rotate-90"
          )}
        />
        {open ? (
          <FolderOpen className="size-3.5 shrink-0 text-muted-foreground/70" />
        ) : (
          <Folder className="size-3.5 shrink-0 text-muted-foreground/70" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {open ? (
        <ul className="ml-4 border-l border-border/70 pl-1.5 space-y-0.5">
          {node.children.map((child, i) => (
            <li key={child.type === "folder" ? `f:${child.path}` : `x:${child.file.id}:${i}`}>
              {child.type === "folder" ? <FolderItem node={child} /> : <FileItem file={child.file} />}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

// ─── Source card ──────────────────────────────────────────────────────────────

function SourceCard({ source }: { source: ViewerSource }) {
  const refreshSource = useViewerStore((s) => s.refreshSource);
  const syncServerSource = useViewerStore((s) => s.syncServerSource);
  const removeSource = useViewerStore((s) => s.removeSource);
  const requestPermissionFor = useViewerStore((s) => s.requestPermissionFor);
  const [browserRefreshing, setBrowserRefreshing] = useState(false);
  const [allOpen, setAllOpen] = useState(true);
  const [collapseSignal, setCollapseSignal] = useState<CollapseSignal>({ gen: 0, open: true });

  const isServer = source.kind === "local-server";
  const syncing = isServer && (source as LocalServerSource).syncing;
  const refreshing = isServer ? syncing : browserRefreshing;

  const hasFolders = useMemo(
    () => source.files.some((f) => f.dirSegments.length > 0),
    [source.files]
  );

  const tree = useMemo(() => buildTree(source.files), [source.files]);

  const onToggleCollapse = () => {
    const next = !allOpen;
    setAllOpen(next);
    setCollapseSignal((s) => ({ gen: s.gen + 1, open: next }));
  };

  const onRefresh = async () => {
    if (isServer) {
      try {
        await syncServerSource(source.id);
        toast.success(`Synced "${source.name}"`);
      } catch (e) {
        toast.error(`Sync failed: ${(e as Error).message}`);
      }
    } else {
      setBrowserRefreshing(true);
      try {
        await refreshSource(source.id);
        toast.success(`Refreshed "${source.name}"`);
      } catch (e) {
        toast.error(`Could not refresh: ${(e as Error).message}`);
      } finally {
        setBrowserRefreshing(false);
      }
    }
  };

  const needsPermission =
    !isServer &&
    (source.permission === "prompt" || source.permission === "denied");

  return (
    <section className="px-2 py-2">
      <div className="flex items-center gap-1 px-1 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {source.kind === "folder" ? (
            <Folder className="size-3.5 text-muted-foreground" />
          ) : source.kind === "files" ? (
            <Files className="size-3.5 text-muted-foreground" />
          ) : (
            <Globe className="size-3.5 text-muted-foreground" />
          )}
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">
            {source.name}
          </span>
          {isServer && (
            <span className="shrink-0 text-[10px] text-muted-foreground/60">
              {(source as LocalServerSource).branch}
            </span>
          )}
        </div>

        {/* Collapse / expand all — only shown when there are folders */}
        {hasFolders && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggleCollapse}
            aria-label={allOpen ? "Collapse all folders" : "Expand all folders"}
            className="text-muted-foreground hover:text-foreground"
          >
            {allOpen ? (
              <ChevronsDownUp className="size-3" />
            ) : (
              <ChevronsUpDown className="size-3" />
            )}
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onRefresh}
          aria-label={isServer ? "Sync repo" : "Refresh source"}
          className={cn(
            "text-muted-foreground hover:text-foreground",
            refreshing && "animate-spin"
          )}
        >
          <RefreshCw className="size-3" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Source actions"
                className="text-muted-foreground hover:text-foreground"
              />
            }
          >
            <MoreHorizontal className="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRefresh}>
              <RefreshCw className="size-3.5" /> {isServer ? "Sync" : "Refresh"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => removeSource(source.id)}
            >
              <Trash2 className="size-3.5" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {needsPermission ? (
        <div className="mx-1 mb-2 rounded-md border border-dashed border-border bg-muted/40 px-2 py-2 text-xs text-muted-foreground">
          <p>Permission required to read this source.</p>
          <Button
            size="xs"
            variant="outline"
            className="mt-1.5"
            onClick={async () => {
              const ok = await requestPermissionFor(source.id);
              if (!ok) toast.error("Permission denied");
            }}
          >
            Grant access
          </Button>
        </div>
      ) : source.files.length === 0 ? (
        <p className="px-2 py-1.5 text-xs text-muted-foreground italic">
          No markdown files found.
        </p>
      ) : (
        <CollapseContext.Provider value={collapseSignal}>
          <ul className="space-y-0.5">
            {tree.map((node, i) => (
              <li key={node.type === "folder" ? `f:${node.path}` : `x:${node.file.id}:${i}`}>
                {node.type === "folder" ? <FolderItem node={node} /> : <FileItem file={node.file} />}
              </li>
            ))}
          </ul>
        </CollapseContext.Provider>
      )}
    </section>
  );
}

// ─── File tree ────────────────────────────────────────────────────────────────

export function FileTree() {
  const activeSourceId = useViewerStore((s) => s.activeSourceId);
  const sources = useViewerStore((s) => s.sources);
  const activeFileId = useViewerStore((s) => s.activeFileId);

  const activeSource = sources.find((s) => s.id === activeSourceId) ?? sources[0] ?? null;

  useEffect(() => {
    if (!activeFileId) return;
    const el = document.querySelector(
      `[data-active-file="${CSS.escape(activeFileId)}"]`
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeFileId]);

  if (!activeSource) return null;

  return (
    <div>
      <SourceCard source={activeSource} />
    </div>
  );
}
