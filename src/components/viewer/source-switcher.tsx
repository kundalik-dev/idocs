"use client";

import { BookOpen, Check, ChevronDown, Files, FolderOpen, Globe, Folder, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  selectActiveSource,
  useViewerStore,
  type ViewerSource,
} from "@/store/viewer-store";
import { fsaSupported, pickDirectory, pickFiles } from "@/lib/fs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function SourceIcon({ source, className }: { source: ViewerSource; className?: string }) {
  if (source.kind === "folder") return <Folder className={cn("shrink-0", className)} />;
  if (source.kind === "files") return <Files className={cn("shrink-0", className)} />;
  if (source.kind === "blog") return <BookOpen className={cn("shrink-0", className)} />;
  return <Globe className={cn("shrink-0", className)} />;
}

function sourceSublabel(source: ViewerSource): string {
  if (source.kind === "local-server") return source.branch;
  if (source.kind === "blog") return "blog";
  if (source.kind === "folder") return "folder";
  return `${source.files.length} file${source.files.length === 1 ? "" : "s"}`;
}

export function SourceSwitcher() {
  const sources = useViewerStore((s) => s.sources);
  const activeSource = useViewerStore(selectActiveSource);
  const setActiveSource = useViewerStore((s) => s.setActiveSource);
  const addFolder = useViewerStore((s) => s.addFolder);
  const addFiles = useViewerStore((s) => s.addFiles);
  const clearAll = useViewerStore((s) => s.clearAll);
  const supported = fsaSupported();

  const onAddFolder = async () => {
    if (!supported) {
      toast.error("File System Access API not supported. Use Chrome, Edge, or Brave.");
      return;
    }
    try {
      const dir = await pickDirectory();
      if (!dir) return;
      await addFolder(dir);
      toast.success(`Opened "${dir.name}"`);
    } catch (e) {
      toast.error((e as Error).message ?? "Could not open folder");
    }
  };

  const onAddFiles = async () => {
    if (!supported) {
      toast.error("File System Access API not supported. Use Chrome, Edge, or Brave.");
      return;
    }
    try {
      const handles = await pickFiles();
      if (handles.length === 0) return;
      await addFiles(handles);
      toast.success(handles.length === 1 ? `Opened "${handles[0].name}"` : `Opened ${handles.length} files`);
    } catch (e) {
      toast.error((e as Error).message ?? "Could not open files");
    }
  };

  const onClearAll = async () => {
    await clearAll();
    toast.success("Library cleared");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex items-center gap-2.5 w-full px-3 py-2.5 text-left",
              "hover:bg-sidebar-accent/60 active:bg-sidebar-accent transition-colors",
              "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset"
            )}
          >
            {activeSource ? (
              <>
                <SourceIcon
                  source={activeSource}
                  className="size-4 text-muted-foreground shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate leading-tight text-foreground">
                    {activeSource.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    {sourceSublabel(activeSource)}
                    {" · "}
                    {activeSource.files.length}{" "}
                    {activeSource.files.length === 1 ? "file" : "files"}
                  </p>
                </div>
              </>
            ) : (
              <span className="text-sm text-muted-foreground flex-1">Select a project</span>
            )}
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground/70" />
          </button>
        }
      />

      <DropdownMenuContent align="start" sideOffset={0} className="w-[--radix-popper-anchor-width]">
        {/* Source list */}
        {sources.map((src) => {
          const active = activeSource?.id === src.id;
          return (
            <DropdownMenuItem
              key={src.id}
              onClick={() => setActiveSource(src.id)}
              className="gap-2.5 py-2 pr-2"
            >
              <SourceIcon source={src} className="size-3.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">{src.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {sourceSublabel(src)}
                  {" · "}
                  {src.files.length} {src.files.length === 1 ? "file" : "files"}
                </p>
              </div>
              <Check
                className={cn(
                  "size-3.5 shrink-0 ml-1 transition-opacity",
                  active ? "opacity-100" : "opacity-0"
                )}
              />
            </DropdownMenuItem>
          );
        })}

        {/* Add actions */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void onAddFolder()} className="gap-2">
          <FolderOpen className="size-3.5 text-muted-foreground" />
          Add folder
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void onAddFiles()} className="gap-2">
          <Plus className="size-3.5 text-muted-foreground" />
          Add files
        </DropdownMenuItem>

        {/* Destructive */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => void onClearAll()}
          className="gap-2"
        >
          <Trash2 className="size-3.5" />
          Clear all
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
