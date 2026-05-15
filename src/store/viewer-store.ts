"use client";

import { create } from "zustand";
import {
  StoredSource,
  StoredServerSource,
  loadActiveFileId,
  loadSidebarOpen,
  loadSources,
  loadServerSources,
  loadServerUrl,
  loadTocOpen,
  saveActiveFileId,
  saveSidebarOpen,
  saveSources,
  saveServerSources,
  saveServerUrl,
  saveTocOpen,
} from "@/lib/idb";
import { WalkedFile, ensureReadPermission, walkDirectory } from "@/lib/fs";
import { ServerClient, type RepoMeta, type FileRef } from "@/lib/local-server-client";
import {
  normalizeBlogManifest,
  type BlogPostManifestItem,
} from "@/lib/blogs";

// ─── File types ───────────────────────────────────────────────────────────────

export type BrowserViewerFile = {
  id: string;
  sourceId: string;
  sourceType: "browser-fs";
  name: string;
  relPath: string;
  dirSegments: string[];
  handle: FileSystemFileHandle;
};

export type ServerViewerFile = {
  id: string;
  sourceId: string;
  sourceType: "local-server";
  name: string;
  relPath: string;
  dirSegments: string[];
  repoId: string;
  serverUrl: string;
};

export type BlogViewerFile = {
  id: string;
  sourceId: string;
  sourceType: "blog-doc";
  name: string;
  relPath: string;
  dirSegments: string[];
  slug: string;
  title: string;
  date: string;
  publicPath: string;
};

export type ViewerFile = BrowserViewerFile | ServerViewerFile | BlogViewerFile;

// ─── Source types ─────────────────────────────────────────────────────────────

type BrowserSource = {
  id: string;
  kind: "folder" | "files";
  name: string;
  directoryHandle?: FileSystemDirectoryHandle;
  fileHandles?: FileSystemFileHandle[];
  files: BrowserViewerFile[];
  permission: "granted" | "prompt" | "denied" | "unknown";
};

export type LocalServerSource = {
  id: string;
  kind: "local-server";
  name: string;
  repoId: string;
  serverUrl: string;
  branch: string;
  files: ServerViewerFile[];
  permission: "granted";
  syncing: boolean;
};

export type BlogSource = {
  id: string;
  kind: "blog";
  name: string;
  files: BlogViewerFile[];
  permission: "granted";
};

export type ViewerSource = BrowserSource | LocalServerSource | BlogSource;

// ─── Store state & actions ────────────────────────────────────────────────────

type State = {
  sources: ViewerSource[];
  activeSourceId: string | null;
  activeFileId: string | null;
  sidebarOpen: boolean;
  tocOpen: boolean;
  hydrated: boolean;
  hydrating: boolean;
  serverUrl: string;
  serverStatus: "disconnected" | "connecting" | "connected" | "error";
};

type Actions = {
  hydrate: () => Promise<void>;
  // browser-fs
  addFolder: (handle: FileSystemDirectoryHandle) => Promise<void>;
  addFiles: (handles: FileSystemFileHandle[]) => Promise<void>;
  removeSource: (sourceId: string) => Promise<void>;
  refreshSource: (sourceId: string) => Promise<void>;
  requestPermissionFor: (sourceId: string) => Promise<boolean>;
  clearAll: () => Promise<void>;
  // local-server
  setServerUrl: (url: string) => Promise<void>;
  setServerStatus: (status: State["serverStatus"]) => void;
  addServerSource: (repo: RepoMeta, files: FileRef[]) => void;
  syncServerSource: (sourceId: string) => Promise<void>;
  removeServerSource: (sourceId: string) => Promise<void>;
  // blog docs
  openBlogDoc: (slug: string) => Promise<boolean>;
  // navigation
  setActiveSource: (sourceId: string) => void;
  setActiveFile: (fileId: string) => void;
  nextFile: () => void;
  prevFile: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleToc: () => void;
  setTocOpen: (open: boolean) => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEGACY_SERVER_URL = "http://127.0.0.1:4873";
const DEFAULT_SERVER_URL = "http://127.0.0.1:5540";

function normalizeServerUrl(url: string | null): string {
  return url === LEGACY_SERVER_URL || url === null ? DEFAULT_SERVER_URL : url;
}

const BLOG_SOURCE_ID = "blog-mdocks";
const BLOG_SOURCE_NAME = "mDocks Blog";

const flatten = (sources: ViewerSource[]): ViewerFile[] =>
  sources.flatMap((s) => s.files as ViewerFile[]);

const makeFolderId = () =>
  `folder-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const makeFilesId = () =>
  `files-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const makeServerId = (repoId: string) => `server-${repoId}`;

function toBrowserFiles(
  sourceId: string,
  walked: WalkedFile[]
): BrowserViewerFile[] {
  return walked.map((w) => ({
    id: `${sourceId}::${w.relPath}`,
    sourceId,
    sourceType: "browser-fs" as const,
    name: w.name,
    relPath: w.relPath,
    dirSegments: w.dirSegments,
    handle: w.handle,
  }));
}

function fromFileHandles(
  sourceId: string,
  handles: FileSystemFileHandle[]
): BrowserViewerFile[] {
  return handles
    .map((h) => ({
      id: `${sourceId}::${h.name}`,
      sourceId,
      sourceType: "browser-fs" as const,
      name: h.name,
      relPath: h.name,
      dirSegments: [] as string[],
      handle: h,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function toServerFiles(sourceId: string, refs: FileRef[], serverUrl: string): ServerViewerFile[] {
  return refs.map((ref) => ({
    id: `${sourceId}::${ref.relPath}`,
    sourceId,
    sourceType: "local-server" as const,
    name: ref.name,
    relPath: ref.relPath,
    dirSegments: ref.relPath.split("/").slice(0, -1),
    repoId: ref.repoId,
    serverUrl,
  }));
}

function toBlogFiles(posts: BlogPostManifestItem[]): BlogViewerFile[] {
  return posts.map((post) => ({
    id: `${BLOG_SOURCE_ID}::${post.slug}`,
    sourceId: BLOG_SOURCE_ID,
    sourceType: "blog-doc" as const,
    name: `${post.title}.md`,
    relPath: post.title,
    dirSegments: [],
    slug: post.slug,
    title: post.title,
    date: post.date,
    publicPath: post.file,
  }));
}

async function loadBlogPosts(): Promise<BlogPostManifestItem[]> {
  const response = await fetch("/blogs/index.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Blog index not found (${response.status})`);
  }
  return normalizeBlogManifest(await response.json());
}

async function persist(state: State): Promise<void> {
  const browserStored: StoredSource[] = (
    state.sources.filter(
      (s): s is BrowserSource => s.kind === "folder" || s.kind === "files"
    )
  ).map((s) =>
    s.kind === "folder"
      ? {
          id: s.id,
          kind: "folder" as const,
          name: s.name,
          addedAt: Date.now(),
          directoryHandle: s.directoryHandle!,
        }
      : {
          id: s.id,
          kind: "files" as const,
          name: s.name,
          addedAt: Date.now(),
          fileHandles: s.fileHandles ?? [],
        }
  );

  const serverStored: StoredServerSource[] = (
    state.sources.filter((s): s is LocalServerSource => s.kind === "local-server")
  ).map((s) => ({
    id: s.id,
    kind: "local-server" as const,
    name: s.name,
    repoId: s.repoId,
    serverUrl: s.serverUrl,
    branch: s.branch,
    addedAt: Date.now(),
  }));

  await Promise.all([
    saveSources(browserStored),
    saveServerSources(serverStored),
    saveActiveFileId(state.activeFileId),
    saveSidebarOpen(state.sidebarOpen),
    saveTocOpen(state.tocOpen),
  ]);
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useViewerStore = create<State & Actions>((set, get) => ({
  sources: [],
  activeSourceId: null,
  activeFileId: null,
  sidebarOpen: true,
  tocOpen: true,
  hydrated: false,
  hydrating: false,
  serverUrl: DEFAULT_SERVER_URL,
  serverStatus: "disconnected",

  hydrate: async () => {
    if (get().hydrated || get().hydrating) return;
    set({ hydrating: true });

    try {
      const [stored, serverStored, savedServerUrl, activeId, sidebarOpen, tocOpen] =
        await Promise.all([
          loadSources(),
          loadServerSources(),
          loadServerUrl(),
          loadActiveFileId(),
          loadSidebarOpen(),
          loadTocOpen(),
        ]);

      const sources: ViewerSource[] = [];

      // Restore browser-fs sources
      for (const s of stored) {
        if (s.kind === "folder") {
          const granted = await ensureReadPermission(s.directoryHandle, false);
          let files: BrowserViewerFile[] = [];
          if (granted) {
            try {
              const walked = await walkDirectory(s.directoryHandle);
              files = toBrowserFiles(s.id, walked);
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
          let allGranted = true;
          for (const fh of s.fileHandles) {
            const ok = await ensureReadPermission(fh, false);
            if (!ok) { allGranted = false; break; }
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

      // Restore server sources — try to re-fetch file lists
      const serverUrl = normalizeServerUrl(savedServerUrl);
      const restoredServerSources: StoredServerSource[] = [];

      for (const s of serverStored) {
        const sourceServerUrl = normalizeServerUrl(s.serverUrl);
        let files: ServerViewerFile[] = [];
        try {
          const client = new ServerClient(sourceServerUrl);
          const refs = await client.listFiles(s.repoId);
          files = toServerFiles(s.id, refs, sourceServerUrl);
        } catch {
          // server offline — restore source with empty file list
        }
        restoredServerSources.push({ ...s, serverUrl: sourceServerUrl });
        sources.push({
          id: s.id,
          kind: "local-server",
          name: s.name,
          repoId: s.repoId,
          serverUrl: sourceServerUrl,
          branch: s.branch,
          files,
          permission: "granted",
          syncing: false,
        });
      }

      const all = flatten(sources);
      const activeStillValid =
        activeId && all.some((f) => f.id === activeId)
          ? activeId
          : all[0]?.id ?? null;

      // Derive activeSourceId from the active file, or fall back to first source
      const activeSourceFromFile = activeStillValid
        ? sources.find((s) => s.files.some((f) => f.id === activeStillValid))?.id ?? null
        : null;

      set({
        sources,
        activeSourceId: activeSourceFromFile ?? sources[0]?.id ?? null,
        activeFileId: activeStillValid,
        sidebarOpen: sidebarOpen ?? true,
        tocOpen: tocOpen ?? true,
        serverUrl,
        hydrated: true,
        hydrating: false,
      });

      if (savedServerUrl !== serverUrl) {
        await saveServerUrl(serverUrl);
      }
      if (restoredServerSources.some((s, i) => s.serverUrl !== serverStored[i]?.serverUrl)) {
        await saveServerSources(restoredServerSources);
      }
    } catch {
      set({ hydrated: true, hydrating: false });
    }
  },

  // ─── Browser-fs actions ───────────────────────────────────────────────────

  addFolder: async (handle) => {
    const id = makeFolderId();
    const walked = await walkDirectory(handle);
    const files = toBrowserFiles(id, walked);
    const next: BrowserSource = {
      id,
      kind: "folder",
      name: handle.name || "Folder",
      directoryHandle: handle,
      files,
      permission: "granted",
    };
    set((s) => {
      const sources = [...s.sources, next];
      const activeFileId = files[0]?.id ?? s.activeFileId ?? null;
      const updated = { ...s, sources, activeSourceId: id, activeFileId };
      void persist(updated);
      return { sources, activeSourceId: id, activeFileId };
    });
  },

  addFiles: async (handles) => {
    if (handles.length === 0) return;
    const id = makeFilesId();
    const files = fromFileHandles(id, handles);
    const next: BrowserSource = {
      id,
      kind: "files",
      name: handles.length === 1 ? handles[0].name : `${handles.length} files`,
      fileHandles: handles,
      files,
      permission: "granted",
    };
    set((s) => {
      const sources = [...s.sources, next];
      const activeFileId = files[0]?.id ?? s.activeFileId ?? null;
      const updated = { ...s, sources, activeSourceId: id, activeFileId };
      void persist(updated);
      return { sources, activeSourceId: id, activeFileId };
    });
  },

  removeSource: async (sourceId) => {
    set((s) => {
      const sources = s.sources.filter((src) => src.id !== sourceId);
      const removingActive = s.activeSourceId === sourceId;
      const activeSourceId = removingActive
        ? sources[0]?.id ?? null
        : s.activeSourceId;
      const activeSourceFiles = activeSourceId
        ? flatten(sources.filter((src) => src.id === activeSourceId))
        : [];
      const activeFileId =
        removingActive
          ? activeSourceFiles[0]?.id ?? null
          : s.activeFileId && flatten(sources).some((f) => f.id === s.activeFileId)
            ? s.activeFileId
            : activeSourceFiles[0]?.id ?? null;
      const updated = { ...s, sources, activeSourceId, activeFileId };
      void persist(updated);
      return { sources, activeSourceId, activeFileId };
    });
  },

  refreshSource: async (sourceId) => {
    const src = get().sources.find((s) => s.id === sourceId);
    if (!src || src.kind === "local-server" || src.kind === "blog") return;

    let nextFiles: BrowserViewerFile[] = src.files;
    if (src.kind === "folder" && src.directoryHandle) {
      const granted = await ensureReadPermission(src.directoryHandle, true);
      if (!granted) return;
      const walked = await walkDirectory(src.directoryHandle);
      nextFiles = toBrowserFiles(src.id, walked);
    } else if (src.kind === "files" && src.fileHandles) {
      for (const fh of src.fileHandles) await ensureReadPermission(fh, true);
      nextFiles = fromFileHandles(src.id, src.fileHandles);
    }

    set((s) => {
      const sources = s.sources.map((s2) =>
        s2.id === sourceId
          ? ({ ...s2, files: nextFiles, permission: "granted" as const } as BrowserSource)
          : s2
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

  requestPermissionFor: async (sourceId) => {
    const src = get().sources.find((s) => s.id === sourceId);
    if (!src || src.kind === "local-server") return false;
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

  clearAll: async () => {
    await saveSources([]);
    await saveServerSources([]);
    await saveActiveFileId(null);
    set({ sources: [], activeSourceId: null, activeFileId: null });
  },

  // ─── Local server actions ─────────────────────────────────────────────────

  setServerUrl: async (url) => {
    await saveServerUrl(url);
    set({ serverUrl: url });
  },

  setServerStatus: (status) => set({ serverStatus: status }),

  addServerSource: (repo, files) => {
    const id = makeServerId(repo.id);
    const serverUrl = get().serverUrl;
    const serverFiles = toServerFiles(id, files, serverUrl);
    const next: LocalServerSource = {
      id,
      kind: "local-server",
      name: repo.name,
      repoId: repo.id,
      serverUrl,
      branch: repo.branch,
      files: serverFiles,
      permission: "granted",
      syncing: false,
    };
    set((s) => {
      // replace if already exists (re-clone), otherwise append
      const exists = s.sources.some((src) => src.id === id);
      const sources = exists
        ? s.sources.map((src) => (src.id === id ? next : src))
        : [...s.sources, next];
      const activeFileId = serverFiles[0]?.id ?? s.activeFileId ?? null;
      const updated = { ...s, sources, activeSourceId: id, activeFileId };
      void persist(updated);
      return { sources, activeSourceId: id, activeFileId };
    });
  },

  syncServerSource: async (sourceId) => {
    const src = get().sources.find((s) => s.id === sourceId);
    if (!src || src.kind !== "local-server") return;

    set((s) => ({
      sources: s.sources.map((s2) =>
        s2.id === sourceId ? { ...s2, syncing: true } : s2
      ),
    }));

    try {
      const client = new ServerClient(src.serverUrl);
      const updatedMeta = await client.syncRepo(src.repoId);
      const refs = await client.listFiles(src.repoId);
      const files = toServerFiles(sourceId, refs, src.serverUrl);
      set((s) => {
        const sources = s.sources.map((s2) =>
          s2.id === sourceId
            ? ({ ...s2, files, branch: updatedMeta.branch, syncing: false } as LocalServerSource)
            : s2
        );
        void persist({ ...s, sources });
        return { sources };
      });
    } catch (e) {
      set((s) => ({
        sources: s.sources.map((s2) =>
          s2.id === sourceId ? { ...s2, syncing: false } : s2
        ),
      }));
      throw e;
    }
  },

  removeServerSource: async (sourceId) => {
    get().removeSource(sourceId);
  },

  // ─── Demo docs ────────────────────────────────────────────────────────────

  openBlogDoc: async (slug) => {
    const posts = await loadBlogPosts();
    const files = toBlogFiles(posts);
    const activeFile = files.find((file) => file.slug === slug);
    if (!activeFile) return false;

    const next: BlogSource = {
      id: BLOG_SOURCE_ID,
      kind: "blog",
      name: BLOG_SOURCE_NAME,
      files,
      permission: "granted",
    };

    set((s) => {
      const exists = s.sources.some((src) => src.id === BLOG_SOURCE_ID);
      const sources = exists
        ? s.sources.map((src) => (src.id === BLOG_SOURCE_ID ? next : src))
        : [next, ...s.sources];

      return {
        sources,
        activeSourceId: BLOG_SOURCE_ID,
        activeFileId: activeFile.id,
      };
    });

    return true;
  },

  // ─── Navigation ───────────────────────────────────────────────────────────

  setActiveSource: (sourceId) => {
    const src = get().sources.find((s) => s.id === sourceId);
    if (!src) return;
    const firstFileId = src.files[0]?.id ?? null;
    set({ activeSourceId: sourceId, activeFileId: firstFileId });
  },

  setActiveFile: (fileId) => {
    set((s) => {
      const updated = { ...s, activeFileId: fileId };
      void persist(updated);
      return { activeFileId: fileId };
    });
  },

  nextFile: () => {
    const { sources, activeSourceId, activeFileId } = get();
    const src = sources.find((s) => s.id === activeSourceId);
    const all = src ? (src.files as ViewerFile[]) : flatten(sources);
    if (all.length === 0) return;
    const idx = all.findIndex((f) => f.id === activeFileId);
    const nextIdx = idx === -1 ? 0 : Math.min(idx + 1, all.length - 1);
    if (idx === nextIdx) return;
    get().setActiveFile(all[nextIdx].id);
  },

  prevFile: () => {
    const { sources, activeSourceId, activeFileId } = get();
    const src = sources.find((s) => s.id === activeSourceId);
    const all = src ? (src.files as ViewerFile[]) : flatten(sources);
    if (all.length === 0) return;
    const idx = all.findIndex((f) => f.id === activeFileId);
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

  toggleToc: () => {
    set((s) => {
      const tocOpen = !s.tocOpen;
      const updated = { ...s, tocOpen };
      void persist(updated);
      return { tocOpen };
    });
  },

  setTocOpen: (open) => {
    set((s) => {
      const updated = { ...s, tocOpen: open };
      void persist(updated);
      return { tocOpen: open };
    });
  },
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectActiveFile = (s: State): ViewerFile | null => {
  const all = flatten(s.sources);
  return all.find((f) => f.id === s.activeFileId) ?? null;
};

export const selectActiveSource = (s: State): ViewerSource | null =>
  s.sources.find((src) => src.id === s.activeSourceId) ?? null;

export const selectAllFiles = (s: State): ViewerFile[] => flatten(s.sources);
