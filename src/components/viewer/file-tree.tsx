"use client";

import { ChevronRight, FileText, Folder, FolderOpen, Files, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  selectActiveFile,
  useViewerStore,
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

type FolderNode = {
  type: "folder";
  name: string;
  path: string; // accumulated path (for stable key + collapse state)
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

  // Sort folders first, then files; alphabetic within each.
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

function FolderItem({ node }: { node: FolderNode }) {
  const [open, setOpen] = useState(true);
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

function SourceCard({ source }: { source: ViewerSource }) {
  const refreshSource = useViewerStore((s) => s.refreshSource);
  const removeSource = useViewerStore((s) => s.removeSource);
  const requestPermissionFor = useViewerStore((s) => s.requestPermissionFor);
  const [refreshing, setRefreshing] = useState(false);

  const tree = useMemo(() => buildTree(source.files), [source.files]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSource(source.id);
      toast.success(`Refreshed “${source.name}”`);
    } catch (e) {
      toast.error(`Couldn't refresh: ${(e as Error).message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const needsPermission = source.permission === "prompt" || source.permission === "denied";

  return (
    <section className="px-2 py-2">
      <div className="flex items-center gap-1 px-1 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {source.kind === "folder" ? (
            <Folder className="size-3.5 text-muted-foreground" />
          ) : (
            <Files className="size-3.5 text-muted-foreground" />
          )}
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">
            {source.name}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onRefresh}
          aria-label="Refresh source"
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
              <RefreshCw className="size-3.5" /> Refresh
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
        <ul className="space-y-0.5">
          {tree.map((node, i) => (
            <li key={node.type === "folder" ? `f:${node.path}` : `x:${node.file.id}:${i}`}>
              {node.type === "folder" ? <FolderItem node={node} /> : <FileItem file={node.file} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function FileTree() {
  const sources = useViewerStore((s) => s.sources);
  const activeFileId = useViewerStore((s) => s.activeFileId);

  // Scroll the active file into view when it changes (for next/prev).
  useEffect(() => {
    if (!activeFileId) return;
    const el = document.querySelector(
      `[data-active-file="${CSS.escape(activeFileId)}"]`
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeFileId]);

  if (sources.length === 0) return null;

  return (
    <div className="flex flex-col">
      {sources.map((s, i) => (
        <div key={s.id}>
          {i > 0 ? <div className="h-px bg-border mx-3" /> : null}
          <SourceCard source={s} />
        </div>
      ))}
    </div>
  );
}
