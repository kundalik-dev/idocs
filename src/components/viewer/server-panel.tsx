"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  GitBranch,
  Globe,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ServerClient, type RepoMeta } from "@/lib/local-server-client";
import { useViewerStore, type LocalServerSource } from "@/store/viewer-store";

const GITHUB_RE =
  /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?(\/.*)?$/i;

const SERVER_COMMAND = "npx mdocs serve";

export function ServerPanel() {
  const serverUrl = useViewerStore((s) => s.serverUrl);
  const serverStatus = useViewerStore((s) => s.serverStatus);
  const setServerUrl = useViewerStore((s) => s.setServerUrl);
  const setServerStatus = useViewerStore((s) => s.setServerStatus);
  const addServerSource = useViewerStore((s) => s.addServerSource);
  const sources = useViewerStore((s) => s.sources);

  const [expanded, setExpanded] = useState(false);
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState(serverUrl);
  const [serverRepos, setServerRepos] = useState<RepoMeta[]>([]);
  const [showCloneForm, setShowCloneForm] = useState(false);
  const [cloneUrl, setCloneUrl] = useState("");
  const [cloneBranch, setCloneBranch] = useState("");
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [cloning, setCloning] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const connected = serverStatus === "connected";

  const addedRepoIds = new Set(
    sources
      .filter((s): s is LocalServerSource => s.kind === "local-server")
      .map((s) => s.repoId)
  );

  // Health poll — initial check shows "connecting", background refreshes are silent
  const HEALTH_POLL_MS = 30_000;

  useEffect(() => {
    let cancelled = false;

    const check = async (initial = false) => {
      if (cancelled) return;
      if (initial) setServerStatus("connecting");
      try {
        const client = new ServerClient(serverUrl);
        await client.checkHealth();
        if (cancelled) return;
        setServerStatus("connected");
        const repos = await client.listRepos();
        if (!cancelled) setServerRepos(repos);
      } catch {
        if (!cancelled) setServerStatus("error");
      }
    };

    void check(true);
    const id = setInterval(() => void check(false), HEALTH_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [serverUrl, setServerStatus]);

  const applyUrl = async () => {
    const trimmed = urlDraft.trim().replace(/\/$/, "");
    setEditingUrl(false);
    if (trimmed === serverUrl) return;
    await setServerUrl(trimmed);
  };

  const handleClone = async () => {
    const url = cloneUrl.trim();
    const branch = cloneBranch.trim() || undefined;
    if (!GITHUB_RE.test(url)) {
      setCloneError(
        "Enter a valid GitHub HTTPS URL, e.g. https://github.com/owner/repo"
      );
      return;
    }
    setCloneError(null);
    setCloning(true);
    try {
      const client = new ServerClient(serverUrl);
      const repo = await client.cloneRepo(url, branch);
      const refs = await client.listFiles(repo.id);
      addServerSource(repo, refs);
      setServerRepos((prev) => [
        ...prev.filter((r) => r.id !== repo.id),
        repo,
      ]);
      setCloneUrl("");
      setCloneBranch("");
      setShowCloneForm(false);
      toast.success(`Cloned ${repo.name}`);
    } catch (e) {
      setCloneError((e as Error).message);
    } finally {
      setCloning(false);
    }
  };

  const handleAdd = async (repo: RepoMeta) => {
    try {
      const client = new ServerClient(serverUrl);
      const refs = await client.listFiles(repo.id);
      addServerSource(repo, refs);
      toast.success(`Added "${repo.name}"`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const dotCn =
    serverStatus === "connected"
      ? "bg-green-500"
      : serverStatus === "connecting"
        ? "bg-yellow-400 animate-pulse"
        : serverStatus === "error"
          ? "bg-red-500"
          : "bg-muted-foreground/40";

  const statusLabel =
    serverStatus === "connected"
      ? "Connected"
      : serverStatus === "connecting"
        ? "Connecting…"
        : serverStatus === "error"
          ? "Offline"
          : "Disconnected";

  return (
    <div className="border-t border-sidebar-border">
      {/* ── Toggle header ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 w-full px-3 py-2.5 text-left hover:bg-sidebar-accent/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
        )}
        <Globe className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground flex-1">
          Local Server
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          <span className={cn("size-1.5 rounded-full", dotCn)} />
          <span className="text-[10px] text-muted-foreground">{statusLabel}</span>
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* ── URL display / edit ── */}
          {editingUrl ? (
            <div className="flex items-center gap-1">
              <input
                ref={urlInputRef}
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void applyUrl();
                  if (e.key === "Escape") {
                    setEditingUrl(false);
                    setUrlDraft(serverUrl);
                  }
                }}
                className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
                placeholder="http://127.0.0.1:4873"
                autoFocus
              />
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => void applyUrl()}
                aria-label="Apply URL"
              >
                <Check className="size-3" />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => {
                  setEditingUrl(false);
                  setUrlDraft(serverUrl);
                }}
                aria-label="Cancel"
              >
                <X className="size-3" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingUrl(true);
                setTimeout(() => urlInputRef.current?.select(), 0);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate w-full text-left"
              title="Click to change server URL"
            >
              {serverUrl}
            </button>
          )}

          {/* ── Offline hint ── */}
          {serverStatus === "error" && (
            <p className="text-[11px] text-muted-foreground leading-snug">
              Can&apos;t reach the server. Run <InlineCopyCommand command={SERVER_COMMAND} />.
            </p>
          )}

          {/* ── Clone form + repo list (shown when connected) ── */}
          {connected && (
            <div className="space-y-2">
              {/* Clone form */}
              {showCloneForm ? (
                <div className="space-y-1.5">
                  <input
                    value={cloneUrl}
                    onChange={(e) => {
                      setCloneUrl(e.target.value);
                      setCloneError(null);
                    }}
                    placeholder="https://github.com/owner/repo"
                    className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                    disabled={cloning}
                  />
                  <input
                    value={cloneBranch}
                    onChange={(e) => setCloneBranch(e.target.value)}
                    placeholder="Branch (default branch if empty)"
                    className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                    disabled={cloning}
                  />
                  {cloneError && (
                    <p className="text-[11px] text-destructive leading-snug">
                      {cloneError}
                    </p>
                  )}
                  <div className="flex items-center gap-1">
                    <Button
                      size="xs"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => void handleClone()}
                      disabled={cloning || !cloneUrl.trim()}
                    >
                      {cloning ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <GitBranch className="size-3" />
                      )}
                      {cloning ? "Cloning…" : "Clone"}
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      disabled={cloning}
                      onClick={() => {
                        setShowCloneForm(false);
                        setCloneUrl("");
                        setCloneBranch("");
                        setCloneError(null);
                      }}
                      aria-label="Cancel clone"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="xs"
                  className="w-full gap-1.5 text-xs"
                  onClick={() => setShowCloneForm(true)}
                >
                  <Plus className="size-3" />
                  Clone a repo
                </Button>
              )}

              {/* Repos already on server */}
              {serverRepos.length > 0 && (
                <div className="space-y-1 pt-0.5">
                  {serverRepos.map((repo) => {
                    const added = addedRepoIds.has(repo.id);
                    return (
                      <div
                        key={repo.id}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <GitBranch className="size-3 shrink-0 text-muted-foreground/60" />
                        <span
                          className="flex-1 truncate text-muted-foreground"
                          title={repo.name}
                        >
                          {repo.name}
                        </span>
                        {added ? (
                          <span className="shrink-0 text-[10px] font-medium text-green-600">
                            Added
                          </span>
                        ) : (
                          <Button
                            size="xs"
                            variant="outline"
                            className="h-5 shrink-0 px-1.5 text-[10px]"
                            onClick={() => void handleAdd(repo)}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InlineCopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      toast.success("Command copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy command");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Command copied" : "Copy server command"}
      title="Copy command"
      className={cn(
        "inline-flex align-baseline items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px] leading-none shadow-sm transition-colors",
        copied
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-border bg-background text-foreground hover:border-foreground/30 hover:bg-muted"
      )}
    >
      <code>{command}</code>
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  );
}
