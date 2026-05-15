// Typed HTTP client for the mDocks local server (http://127.0.0.1:5540).
// Types are defined locally; do not import from @mdocks/server (Node.js package).

export interface RepoMeta {
  id: string;
  name: string; // "owner/repo"
  url: string;
  branch: string;
  clonedAt: string;
  lastSyncedAt: string | null;
  currentCommit: string | null;
  fileCount: number;
}

export interface FileRef {
  id: string;
  repoId: string;
  name: string;
  relPath: string;
  size: number;
  lastModified: number;
}

export interface FileContent extends FileRef {
  content: string;
}

export interface HealthResponse {
  ok: boolean;
  name: string;
  version: string;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export class ServerClient {
  constructor(readonly baseUrl: string) {}

  checkHealth(): Promise<HealthResponse> {
    return request<HealthResponse>(`${this.baseUrl}/health`, {
      signal: AbortSignal.timeout(3000),
    });
  }

  listRepos(): Promise<RepoMeta[]> {
    return request<RepoMeta[]>(`${this.baseUrl}/api/repos`);
  }

  cloneRepo(url: string, branch?: string): Promise<RepoMeta> {
    return request<RepoMeta>(`${this.baseUrl}/api/repos/clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, ...(branch ? { branch } : {}) }),
    });
  }

  syncRepo(repoId: string): Promise<RepoMeta> {
    return request<RepoMeta>(`${this.baseUrl}/api/repos/${repoId}/sync`, {
      method: "POST",
    });
  }

  listFiles(repoId: string): Promise<FileRef[]> {
    return request<FileRef[]>(`${this.baseUrl}/api/repos/${repoId}/files`);
  }

  readFile(repoId: string, relPath: string): Promise<FileContent> {
    return request<FileContent>(
      `${this.baseUrl}/api/repos/${repoId}/files/${relPath}`
    );
  }

  deleteRepo(repoId: string): Promise<void> {
    return request<void>(`${this.baseUrl}/api/repos/${repoId}`, {
      method: "DELETE",
    });
  }
}
