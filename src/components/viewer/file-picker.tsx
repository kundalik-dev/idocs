"use client";

import { Files, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fsaSupported, pickDirectory, pickFiles } from "@/lib/fs";
import { useViewerStore } from "@/store/viewer-store";
import { toast } from "sonner";

type Variant = "primary" | "compact";

export function FilePicker({ variant = "primary" }: { variant?: Variant }) {
  const addFolder = useViewerStore((s) => s.addFolder);
  const addFiles = useViewerStore((s) => s.addFiles);

  const supported = fsaSupported();

  async function onPickFolder() {
    if (!supported) {
      toast.error("Your browser doesn't support the File System Access API. Try Chrome, Edge, Brave, or Arc.");
      return;
    }
    try {
      const dir = await pickDirectory();
      if (!dir) return;
      await addFolder(dir);
      toast.success(`Opened folder “${dir.name}”`);
    } catch (e) {
      toast.error((e as Error).message ?? "Couldn't open folder");
    }
  }

  async function onPickFiles() {
    if (!supported) {
      toast.error("Your browser doesn't support the File System Access API. Try Chrome, Edge, Brave, or Arc.");
      return;
    }
    try {
      const handles = await pickFiles();
      if (handles.length === 0) return;
      await addFiles(handles);
      toast.success(
        handles.length === 1
          ? `Opened “${handles[0].name}”`
          : `Opened ${handles.length} files`
      );
    } catch (e) {
      toast.error((e as Error).message ?? "Couldn't open files");
    }
  }

  if (variant === "compact") {
    return (
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={onPickFolder}>
          <FolderOpen className="size-3.5" />
          Folder
        </Button>
        <Button size="sm" variant="outline" onClick={onPickFiles}>
          <Files className="size-3.5" />
          Files
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="size-12 rounded-full grid place-items-center bg-muted text-muted-foreground">
        <Plus className="size-5" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold">No documents open yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Pick a folder or individual <code className="font-mono text-xs">.md</code>{" "}
          files from your computer to start reading.
        </p>
      </div>
      <div className="flex gap-2 mt-1">
        <Button onClick={onPickFolder}>
          <FolderOpen className="size-4" />
          Open folder
        </Button>
        <Button variant="outline" onClick={onPickFiles}>
          <Files className="size-4" />
          Open files
        </Button>
      </div>
      {!supported ? (
        <p className="mt-3 text-xs text-destructive max-w-sm text-center">
          File System Access isn&apos;t available here. Open this app in Chrome,
          Edge, Brave, or Arc.
        </p>
      ) : null}
    </div>
  );
}
