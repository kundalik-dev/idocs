// IndexedDB-backed persistence of FileSystem handles + light source metadata.
// We can't JSON-stringify FileSystem handles, but they ARE structured-cloneable
// and persist across sessions when stored via IndexedDB.

import { get, set, del, createStore } from "idb-keyval";

const store = createStore("idocs-db", "idocs-store");
const SOURCES_KEY = "sources:v1";
const ACTIVE_KEY = "activeFileId:v1";
const SIDEBAR_KEY = "sidebarOpen:v1";

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
