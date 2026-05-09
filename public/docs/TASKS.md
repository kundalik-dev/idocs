# iDocs Implementation Tasks

Track progress here. Check the box when a task is complete.

---

## Phase 1 — Infra

- [ ] **#1** Set up monorepo structure with pnpm workspaces and Turbo
  - Create `pnpm-workspace.yaml`, `turbo.json`, root `package.json`
  - Scaffold `apps/web`, `packages/shared`, `packages/server`, `packages/cli`, `tooling/`

- [ ] **#2** Create `packages/shared` with API contracts and source types
  - `api-types.ts` — RepoSummary, file response shape
  - `source-types.ts` — ViewerSource, ViewerFile, BrowserFileRef, ServerFileRef
  - `constants.ts` — default port 4873, storage dir
  - `markdown.ts` — shared helpers

---

## Phase 2 — Local Server (`packages/server`)

- [ ] **#3** Scaffold `packages/server` HTTP server entry point
  - `index.ts`, `app.ts`, `config.ts`
  - Bind to `127.0.0.1:4873`

- [ ] **#4** Implement `/health` endpoint
  - Returns `{ ok: true, name: "idocs-server", version: "0.1.0" }`

- [ ] **#5** Implement CORS and security middleware
  - Origin allowlist (Vercel prod + localhost:3000)
  - `security/cors.ts`, `security/paths.ts`, `security/github-url.ts`
  - Validate Origin on mutating routes, prevent path traversal

- [ ] **#6** Implement JSON-based repo metadata store
  - `storage/repo-store.ts` reads/writes `.idocs/repos.json`
  - Stores only `{ id, url, branch }` per repo
  - Everything else derived from filesystem and git at runtime

- [ ] **#7** Implement Git service (clone, fetch, pull)
  - `services/git.ts`
  - Strict argument arrays, no shell string composition
  - `cloneRepo`, `pullRepo`, `fetchRepo`, `getHeadCommit`

- [ ] **#8** Implement repo-store and markdown scanner services
  - `services/repo-store.ts` — repo CRUD on JSON store
  - `services/scanner.ts` — recursive walk, skip `.git`/`node_modules`/`.next`/`dist`/`build`
  - `services/file-reader.ts` — single file read with path traversal check and size limit

- [ ] **#9** Implement `POST /api/repos/clone`
  - Validate GitHub HTTPS URL
  - Clone into `.idocs/repos/github.com/owner/repo`
  - Scan markdown files, persist to store, return RepoSummary

- [ ] **#10** Implement `GET /api/repos` and `POST /api/repos/:repoId/sync`
  - List all repos from JSON store
  - Sync: git fetch/pull, rescan files, update store

- [ ] **#11** Implement `GET /api/repos/:repoId/files` and `/files/:fileId`
  - File list: id, name, relPath, dirSegments, size, lastModified
  - File read: content + metadata, path traversal guard, size limit

---

## Phase 3 — CLI (`packages/cli`)

- [ ] **#12** Scaffold `packages/cli` with `npx idocs server` command
  - `bin/idocs.ts` entry point
  - `commands/server.ts` with `--port`, `--host`, `--data-dir`, `--origin` flags
  - Print startup info on launch

---

## Phase 4 — Frontend Integration

- [ ] **#13** Add local server API client (`src/lib/local-server-client.ts`)
  - Typed fetch wrappers: `checkHealth`, `listRepos`, `cloneRepo`, `syncRepo`, `listFiles`, `readFile`
  - Handle offline/error states

- [ ] **#14** Extend viewer store and IDB with `local-server` source type
  - Update `viewer-store.ts` for ViewerSource union
  - Persist local-server source metadata in IndexedDB
  - Keep all existing browser-fs behavior intact

- [ ] **#15** Build local server connection panel UI
  - Poll `/health` on mount
  - Show connected / disconnected / error states
  - Allow changing URL and port
  - Persist last successful URL in IndexedDB

- [ ] **#16** Add GitHub URL clone flow to frontend
  - GitHub URL input (shown when server is connected)
  - Client-side URL validation
  - Loading state during clone
  - Clear error messages

- [ ] **#17** Show cloned repos in sidebar with unified file tree
  - Render local-server sources alongside browser-fs sources
  - Group files by `dirSegments` for tree structure
  - Show repo name and branch as source header

- [ ] **#18** Implement local-server file loading in the viewer
  - Branch `use-file-content.ts` on `sourceType`
  - Call `localServerClient.readFile()` for server files
  - Pipe through existing markdown pipeline
  - Handle loading, offline, and file-missing states

---

## Phase 5 — Sync

- [ ] **#19** Add manual sync button per cloned repo
  - Sync button per local-server source in sidebar
  - Status labels: Syncing / Synced / Failed / Update available / Server offline
  - Refresh file tree after sync
  - Reload active file or show missing-file state

---

## Phase 6 — Hardening

- [ ] **#20** Add repo deletion, auto sync, and limits
  - `DELETE /api/repos/:repoId` endpoint
  - Remove-repo UI in frontend
  - Clone size limits and scan depth limits on server
  - Auto sync with configurable interval
  - Origin allowlist config option in CLI

---

## Notes

- Browser File API mode must remain fully working throughout all phases.
- Never upload document content to Vercel.
- Local server binds to `127.0.0.1` only — never `0.0.0.0`.
- Use strict git argument arrays — no shell string composition.
- Test with Chrome/Edge/Brave (File System Access API required).
