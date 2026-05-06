// File System Access API helpers. Chromium-only. All paths flow through here.

declare global {
  interface FileSystemHandle {
    queryPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
    requestPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
  }
  interface Window {
    showDirectoryPicker?: (options?: {
      id?: string;
      mode?: "read" | "readwrite";
      startIn?: string;
    }) => Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker?: (options?: {
      multiple?: boolean;
      excludeAcceptAllOption?: boolean;
      id?: string;
      types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
      }>;
    }) => Promise<FileSystemFileHandle[]>;
  }
}

export const MD_EXTENSIONS = [".md", ".markdown", ".mdx"] as const;

export function fsaSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.showDirectoryPicker === "function" &&
    typeof window.showOpenFilePicker === "function"
  );
}

export function isMarkdownName(name: string): boolean {
  const lower = name.toLowerCase();
  return MD_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export async function pickDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!window.showDirectoryPicker) return null;
  try {
    return await window.showDirectoryPicker({ id: "idocs-folder", mode: "read" });
  } catch (err) {
    if ((err as DOMException)?.name === "AbortError") return null;
    throw err;
  }
}

export async function pickFiles(): Promise<FileSystemFileHandle[]> {
  if (!window.showOpenFilePicker) return [];
  try {
    return await window.showOpenFilePicker({
      multiple: true,
      id: "idocs-files",
      types: [
        {
          description: "Markdown files",
          accept: { "text/markdown": [".md", ".markdown", ".mdx"] },
        },
      ],
      excludeAcceptAllOption: false,
    });
  } catch (err) {
    if ((err as DOMException)?.name === "AbortError") return [];
    throw err;
  }
}

export async function ensureReadPermission(
  handle: FileSystemHandle,
  prompt = false
): Promise<boolean> {
  if (!handle.queryPermission) return true; // older impls — assume granted
  const opts = { mode: "read" as const };
  const status = await handle.queryPermission(opts);
  if (status === "granted") return true;
  if (!prompt || !handle.requestPermission) return false;
  const requested = await handle.requestPermission(opts);
  return requested === "granted";
}

export type WalkedFile = {
  /** unique id within a single source, derived from rel path */
  id: string;
  /** file name only */
  name: string;
  /** path relative to the picked root (no leading slash) */
  relPath: string;
  /** segments above the file, e.g. ["guides", "intro"] */
  dirSegments: string[];
  /** the live handle */
  handle: FileSystemFileHandle;
};

const PRUNE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".cache",
  ".vercel",
]);

/** Recursively walks a directory handle for markdown files. */
export async function walkDirectory(
  dir: FileSystemDirectoryHandle,
  trail: string[] = []
): Promise<WalkedFile[]> {
  const out: WalkedFile[] = [];
  // FileSystemDirectoryHandle is async-iterable: yields [name, handle].
  for await (const [name, handle] of dir as unknown as AsyncIterable<
    [string, FileSystemHandle]
  >) {
    if (handle.kind === "directory") {
      if (PRUNE_DIRS.has(name) || name.startsWith(".")) continue;
      const nested = await walkDirectory(
        handle as FileSystemDirectoryHandle,
        [...trail, name]
      );
      out.push(...nested);
    } else if (handle.kind === "file" && isMarkdownName(name)) {
      const relPath = [...trail, name].join("/");
      out.push({
        id: relPath,
        name,
        relPath,
        dirSegments: trail,
        handle: handle as FileSystemFileHandle,
      });
    }
  }
  out.sort((a, b) => a.relPath.localeCompare(b.relPath));
  return out;
}

export async function readFile(handle: FileSystemFileHandle): Promise<{
  text: string;
  lastModified: number;
  size: number;
}> {
  const file = await handle.getFile();
  const text = await file.text();
  return { text, lastModified: file.lastModified, size: file.size };
}

export async function getLastModified(
  handle: FileSystemFileHandle
): Promise<number> {
  const file = await handle.getFile();
  return file.lastModified;
}
