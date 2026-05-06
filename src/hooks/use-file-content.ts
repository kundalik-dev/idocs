"use client";

import { useCallback, useEffect, useState } from "react";
import { getLastModified, readFile } from "@/lib/fs";

export type FileContentState = {
  text: string | null;
  lastModified: number | null;
  loading: boolean;
  error: Error | null;
  /** Forces a re-read even if mtime hasn't changed. */
  reload: () => void;
};

const POLL_INTERVAL_MS = 2000;

/**
 * Reads the active file and quietly polls its lastModified for live reload.
 * Polling stops when the document is hidden and resumes on focus.
 *
 * State is reset during render whenever the handle changes (the standard
 * "derived-from-prop" React pattern), then the effect kicks off the read.
 */
export function useFileContent(
  handle: FileSystemFileHandle | null
): FileContentState {
  const [text, setText] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Reset visible state when the handle changes — render-phase setState pattern.
  const [trackedHandle, setTrackedHandle] = useState<FileSystemFileHandle | null>(
    handle
  );
  if (trackedHandle !== handle) {
    setTrackedHandle(handle);
    setText(null);
    setLastModified(null);
    setError(null);
    setLoading(false);
  }

  useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    let knownMtime: number | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const doRead = async (force: boolean) => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      try {
        const result = await readFile(handle);
        if (cancelled) return;
        if (force || knownMtime !== result.lastModified) {
          knownMtime = result.lastModified;
          setText(result.text);
          setLastModified(result.lastModified);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void doRead(true);

    const tick = async () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.hidden) {
        timer = setTimeout(tick, POLL_INTERVAL_MS);
        return;
      }
      try {
        const mtime = await getLastModified(handle);
        if (cancelled) return;
        if (knownMtime !== null && mtime !== knownMtime) {
          await doRead(false);
        }
      } catch {
        // permission may be revoked; user can refresh manually
      } finally {
        if (!cancelled) timer = setTimeout(tick, POLL_INTERVAL_MS);
      }
    };

    timer = setTimeout(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [handle, reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  return { text, lastModified, loading, error, reload };
}
