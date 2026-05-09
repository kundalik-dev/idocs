// IndexedDB-backed persistence of FileSystem handles + light source metadata.
// We can't JSON-stringify FileSystem handles, but they ARE structured-cloneable
// and persist across sessions when stored via IndexedDB.

import { get, set, del, createStore } from "idb-keyval";

const store = createStore("mdocs-db", "mdocs-store");

const SOURCES_KEY = "sources:v1";
const ACTIVE_KEY = "activeFileId:v1";
const SIDEBAR_KEY = "sidebarOpen:v1";
const TOC_KEY = "tocOpen:v1";
const SERVER_URL_KEY = "serverUrl:v1";
const SERVER_SOURCES_KEY = "serverSources:v1";

// ─── Browser-fs sources ───────────────────────────────────────────────────────

export type StoredSource =
  | {
      id: string;
      kind: "folder";
      name: string;
      addedAt: number;
      directoryHandle: FileSystemDirectoryHandle;
    }
  | {
      id: string;
      kind: "files";
      name: string;
      addedAt: number;
      fileHandles: FileSystemFileHandle[];
    };

export async function saveSources(sources: StoredSource[]): Promise<void> {
  await set(SOURCES_KEY, sources, store);
}

export async function loadSources(): Promise<StoredSource[]> {
  const v = await get<StoredSource[]>(SOURCES_KEY, store);
  return Array.isArray(v) ? v : [];
}

export async function clearSources(): Promise<void> {
  await del(SOURCES_KEY, store);
}

// ─── Server sources (plain JSON — no handles) ─────────────────────────────────

export type StoredServerSource = {
  id: string;
  kind: "local-server";
  name: string;
  repoId: string;
  serverUrl: string;
  branch: string;
  addedAt: number;
};

export async function saveServerSources(sources: StoredServerSource[]): Promise<void> {
  await set(SERVER_SOURCES_KEY, sources, store);
}

export async function loadServerSources(): Promise<StoredServerSource[]> {
  const v = await get<StoredServerSource[]>(SERVER_SOURCES_KEY, store);
  return Array.isArray(v) ? v : [];
}

// ─── Server URL ───────────────────────────────────────────────────────────────

export async function saveServerUrl(url: string): Promise<void> {
  await set(SERVER_URL_KEY, url, store);
}

export async function loadServerUrl(): Promise<string | null> {
  const v = await get<string>(SERVER_URL_KEY, store);
  return typeof v === "string" ? v : null;
}

// ─── UI state ─────────────────────────────────────────────────────────────────

export async function saveActiveFileId(id: string | null): Promise<void> {
  if (id === null) await del(ACTIVE_KEY, store);
  else await set(ACTIVE_KEY, id, store);
}

export async function loadActiveFileId(): Promise<string | null> {
  const v = await get<string>(ACTIVE_KEY, store);
  return typeof v === "string" ? v : null;
}

export async function saveSidebarOpen(open: boolean): Promise<void> {
  await set(SIDEBAR_KEY, open, store);
}

export async function loadSidebarOpen(): Promise<boolean | null> {
  const v = await get<boolean>(SIDEBAR_KEY, store);
  return typeof v === "boolean" ? v : null;
}

export async function saveTocOpen(open: boolean): Promise<void> {
  await set(TOC_KEY, open, store);
}

export async function loadTocOpen(): Promise<boolean | null> {
  const v = await get<boolean>(TOC_KEY, store);
  return typeof v === "boolean" ? v : null;
}
