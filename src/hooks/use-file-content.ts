"use client";

import { useCallback, useEffect, useState } from "react";
import { getLastModified, readFile } from "@/lib/fs";
import { ServerClient } from "@/lib/local-server-client";
import type { ViewerFile } from "@/store/viewer-store";

export type FileContentState = {
  text: string | null;
  lastModified: number | null;
  loading: boolean;
  error: Error | null;
  /** Forces a re-read even if mtime hasn't changed. */
  reload: () => void;
};

const POLL_INTERVAL_MS = 2000;

export function useFileContent(file: ViewerFile | null): FileContentState {
  const [text, setText] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Reset derived state when the active file changes (render-phase setState).
  const [trackedId, setTrackedId] = useState<string | null>(file?.id ?? null);
  if (trackedId !== (file?.id ?? null)) {
    setTrackedId(file?.id ?? null);
    setText(null);
    setLastModified(null);
    setError(null);
    setLoading(false);
  }

  useEffect(() => {
    if (!file) return;

    if (file.sourceType === "demo-doc") {
      let cancelled = false;
      setLoading(true);
      setError(null);

      fetch(file.publicPath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Demo document not found (${response.status})`);
          }
          return response.text();
        })
        .then((content) => {
          if (cancelled) return;
          setText(content);
          setLastModified(Date.now());
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          setError(e instanceof Error ? e : new Error(String(e)));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }

    if (file.sourceType === "local-server") {
      let cancelled = false;
      setLoading(true);
      setError(null);

      const client = new ServerClient(file.serverUrl);
      client
        .readFile(file.repoId, file.relPath)
        .then((result) => {
          if (cancelled) return;
          setText(result.content);
          setLastModified(result.lastModified);
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          setError(e instanceof Error ? e : new Error(String(e)));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }

    // browser-fs: poll mtime for live reload
    const handle = file.handle;
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
        // permission may be revoked; user can reload manually
      } finally {
        if (!cancelled) timer = setTimeout(tick, POLL_INTERVAL_MS);
      }
    };

    timer = setTimeout(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [file, reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  return { text, lastModified, loading, error, reload };
}
