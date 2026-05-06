"use client";

// Central app state for the viewer. Keeps in-memory model of sources + active
// file. Mirrors persistable parts to IndexedDB on every mutation.

import { create } from "zustand";
import {
  StoredSource,
  loadActiveFileId,
  loadSidebarOpen,
  loadSources,
  saveActiveFileId,
  saveSidebarOpen,
  saveSources,
} from "@/lib/idb";
import {
  WalkedFile,
  ensureReadPermission,
  walkDirectory,
} from "@/lib/fs";

export type ViewerFile = {
  /** globally unique: `${sourceId}::${relPath}` */
  id: string;
  sourceId: string;
  name: string;
  relPath: string;
  dirSegments: string[];
  handle: FileSystemFileHandle;
};

export type ViewerSource = {
  id: string;
  kind: "folder" | "files";
  name: string;
  /** for folders, present and re-walkable; for "files", absent */
  directoryHandle?: FileSystemDirectoryHandle;
  /** for "files" sources, the original picked handles (used to re-resolve) */
  fileHandles?: FileSystemFileHandle[];
  files: ViewerFile[];
  /** transient permission state; "unknown" until first check */
  permission: "granted" | "prompt" | "denied" | "unknown";
};

type State = {
  sources: ViewerSource[];
  activeFileId: string | null;
  sidebarOpen: boolean;
  hydrated: boolean;
  hydrating: boolean;
};

type Actions = {
  hydrate: () => Promise<void>;
  addFolder: (handle: FileSystemDirectoryHandle) => Promise<void>;
  addFiles: (handles: FileSystemFileHandle[]) => Promise<void>;
  removeSource: (sourceId: string) => Promise<void>;
  refreshSource: (sourceId: string) => Promise<void>;
  setActiveFile: (fileId: string) => void;
  nextFile: () => void;
  prevFile: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  requestPermissionFor: (sourceId: string) => Promise<boolean>;
  clearAll: () => Promise<void>;
};

const flatten = (sources: ViewerSource[]): ViewerFile[] =>
  sources.flatMap((s) => s.files);

const makeFolderId = () =>
  `folder-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const makeFilesId = () =>
  `files-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function toViewerFiles(sourceId: string, walked: WalkedFile[]): ViewerFile[] {
  return walked.map((w) => ({
    id: `${sourceId}::${w.relPath}`,
    sourceId,
    name: w.name,
    relPath: w.relPath,
    dirSegments: w.dirSegments,
    handle: w.handle,
  }));
}

function fromFileHandles(
  sourceId: string,
  handles: FileSystemFileHandle[]
): ViewerFile[] {
  return handles
    .map((h) => ({
      id: `${sourceId}::${h.name}`,
      sourceId,
      name: h.name,
      relPath: h.name,
      dirSegments: [] as string[],
      handle: h,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function persist(state: State): Promise<void> {
  const stored: StoredSource[] = state.sources.map((s) =>
    s.kind === "folder"
      ? {
          id: s.id,
          kind: "folder",
          name: s.name,
          addedAt: Date.now(),
          directoryHandle: s.directoryHandle!,
        }
      : {
          id: s.id,
          kind: "files",
          name: s.name,
          addedAt: Date.now(),
          fileHandles: s.fileHandles ?? [],
        }
  );
  await saveSources(stored);
  await saveActiveFileId(state.activeFileId);
  await saveSidebarOpen(state.sidebarOpen);
}

export const useViewerStore = create<State & Actions>((set, get) => ({
  sources: [],
  activeFileId: null,
  sidebarOpen: true,
  hydrated: false,
  hydrating: false,

  hydrate: async () => {
    if (get().hydrated || get().hydrating) return;
    set({ hydrating: true });
    try {
      const [stored, activeId, sidebarOpen] = await Promise.all([
        loadSources(),
        loadActiveFileId(),
        loadSidebarOpen(),
      ]);

      const sources: ViewerSource[] = [];
      for (const s of stored) {
        if (s.kind === "folder") {
          const granted = await ensureReadPermission(s.directoryHandle, false);
          let files: ViewerFile[] = [];
          if (granted) {
            try {
              const walked = await walkDirectory(s.directoryHandle);
              files = toViewerFiles(s.id, walked);
            } catch {
              // permission may be revoked between sessions; leave empty
            }
          }
          sources.push({
            id: s.id,
            kind: "folder",
            name: s.name,
            directoryHandle: s.directoryHandle,
            files,
            permission: granted ? "granted" : "prompt",
          });
        } else {
          // For files, permission is per-handle — try to resolve all.
          let allGranted = true;
          for (const fh of s.fileHandles) {
            const ok = await ensureReadPermission(fh, false);
            if (!ok) {
              allGranted = false;
              break;
            }
          }
          sources.push({
            id: s.id,
            kind: "files",
            name: s.name,
            fileHandles: s.fileHandles,
            files: fromFileHandles(s.id, s.fileHandles),
            permission: allGranted ? "granted" : "prompt",
          });
        }
      }

      // Validate active id still exists.
      const all = flatten(sources);
      const activeStillValid =
        activeId && all.some((f) => f.id === activeId) ? activeId : all[0]?.id ?? null;

      set({
        sources,
        activeFileId: activeStillValid,
        sidebarOpen: sidebarOpen ?? true,
        hydrated: true,
        hydrating: false,
      });
    } catch {
      set({ hydrated: true, hydrating: false });
    }
  },

  addFolder: async (handle) => {
    const id = makeFolderId();
    const walked = await walkDirectory(handle);
    const files = toViewerFiles(id, walked);
    const next: ViewerSource = {
      id,
      kind: "folder",
      name: handle.name || "Folder",
      directoryHandle: handle,
      files,
      permission: "granted",
    };
    set((s) => {
      const sources = [...s.sources, next];
      const activeFileId =
        s.activeFileId ?? files[0]?.id ?? null;
      const updated = { ...s, sources, activeFileId };
      void persist(updated);
      return { sources, activeFileId };
    });
  },

  addFiles: async (handles) => {
    if (handles.length === 0) return;
    const id = makeFilesId();
    const files = fromFileHandles(id, handles);
    const next: ViewerSource = {
      id,
      kind: "files",
      name: handles.length === 1 ? handles[0].name : `${handles.length} files`,
      fileHandles: handles,
      files,
      permission: "granted",
    };
    set((s) => {
      const sources = [...s.sources, next];
      const activeFileId = s.activeFileId ?? files[0]?.id ?? null;
      const updated = { ...s, sources, activeFileId };
      void persist(updated);
      return { sources, activeFileId };
    });
  },

  removeSource: async (sourceId) => {
    set((s) => {
      const sources = s.sources.filter((src) => src.id !== sourceId);
      const stillActive =
        s.activeFileId && flatten(sources).some((f) => f.id === s.activeFileId);
      const activeFileId = stillActive
        ? s.activeFileId
        : flatten(sources)[0]?.id ?? null;
      const updated = { ...s, sources, activeFileId };
      void persist(updated);
      return { sources, activeFileId };
    });
  },

  refreshSource: async (sourceId) => {
    const src = get().sources.find((s) => s.id === sourceId);
    if (!src) return;

    let nextFiles: ViewerFile[] = src.files;
    if (src.kind === "folder" && src.directoryHandle) {
      const granted = await ensureReadPermission(src.directoryHandle, true);
      if (!granted) return;
      const walked = await walkDirectory(src.directoryHandle);
      nextFiles = toViewerFiles(src.id, walked);
    } else if (src.kind === "files" && src.fileHandles) {
      // Re-grant permission if needed; file lists themselves don't change.
      for (const fh of src.fileHandles) {
        await ensureReadPermission(fh, true);
      }
      nextFiles = fromFileHandles(src.id, src.fileHandles);
    }

    set((s) => {
      const sources = s.sources.map((src2) =>
        src2.id === sourceId
          ? { ...src2, files: nextFiles, permission: "granted" as const }
          : src2
      );
      const allIds = new Set(flatten(sources).map((f) => f.id));
      const activeFileId =
        s.activeFileId && allIds.has(s.activeFileId)
          ? s.activeFileId
          : flatten(sources)[0]?.id ?? null;
      const updated = { ...s, sources, activeFileId };
      void persist(updated);
      return { sources, activeFileId };
    });
  },

  setActiveFile: (fileId) => {
    set((s) => {
      const updated = { ...s, activeFileId: fileId };
      void persist(updated);
      return { activeFileId: fileId };
    });
  },

  nextFile: () => {
    const all = flatten(get().sources);
    if (all.length === 0) return;
    const idx = all.findIndex((f) => f.id === get().activeFileId);
    const nextIdx = idx === -1 ? 0 : Math.min(idx + 1, all.length - 1);
    if (idx === nextIdx) return;
    get().setActiveFile(all[nextIdx].id);
  },

  prevFile: () => {
    const all = flatten(get().sources);
    if (all.length === 0) return;
    const idx = all.findIndex((f) => f.id === get().activeFileId);
    const prevIdx = idx === -1 ? 0 : Math.max(idx - 1, 0);
    if (idx === prevIdx) return;
    get().setActiveFile(all[prevIdx].id);
  },

  toggleSidebar: () => {
    set((s) => {
      const sidebarOpen = !s.sidebarOpen;
      const updated = { ...s, sidebarOpen };
      void persist(updated);
      return { sidebarOpen };
    });
  },

  setSidebarOpen: (open) => {
    set((s) => {
      const updated = { ...s, sidebarOpen: open };
      void persist(updated);
      return { sidebarOpen: open };
    });
  },

  clearAll: async () => {
    await saveSources([]);
    await saveActiveFileId(null);
    set({ sources: [], activeFileId: null });
  },

  requestPermissionFor: async (sourceId) => {
    const src = get().sources.find((s) => s.id === sourceId);
    if (!src) return false;
    if (src.kind === "folder" && src.directoryHandle) {
      const ok = await ensureReadPermission(src.directoryHandle, true);
      if (ok) await get().refreshSource(sourceId);
      return ok;
    }
    if (src.kind === "files" && src.fileHandles) {
      let allOk = true;
      for (const fh of src.fileHandles) {
        const ok = await ensureReadPermission(fh, true);
        if (!ok) allOk = false;
      }
      if (allOk) await get().refreshSource(sourceId);
      return allOk;
    }
    return false;
  },
}));

export const selectActiveFile = (s: State): ViewerFile | null => {
  const all = flatten(s.sources);
  return all.find((f) => f.id === s.activeFileId) ?? null;
};

export const selectAllFiles = (s: State): ViewerFile[] => flatten(s.sources);
