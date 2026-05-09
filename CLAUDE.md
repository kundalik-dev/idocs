# Claude Project Context — mDocs Frontend

Read this file first when you are the next AI assistant working on this repo.

## Project Summary

This project is **mDocs**, a local-first Markdown reader and GitHub repo browser. It has two modes:
1. **Browser files** — open local folders/files via the File System Access API (no install needed, Chromium only)
2. **Local server** — connect to `npx mdocs serve` running on `127.0.0.1:4873` to clone and browse GitHub repos

Documents never leave the machine. No uploads, no backend persistence.

## Non-Negotiable Repo Instruction

This repo uses **Next.js 16.2.5**, and APIs/conventions may differ from training data.

Before editing Next.js app code, read the relevant docs from:
```text
node_modules/next/dist/docs/
```

Do not rely only on older Next.js memory.

## Stack

- Next.js 16.2.5, App Router, Turbopack
- React 19.2.4
- TypeScript 5, strict mode
- Tailwind CSS v4
- shadcn/ui with Base UI primitives (`@base-ui-react`)
- Zustand 5 for viewer state
- `idb-keyval` for IndexedDB persistence
- File System Access API for local files
- `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`
- Shiki for syntax highlighting
- `gray-matter` for frontmatter
- `next-themes` for light/dark mode
- Sonner for toasts
- Lucide React for icons

## Commands

```bash
pnpm install
pnpm dev        # starts on http://localhost:3000
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Key Routes

- `/` — landing page (features, two-modes section, npx command with copy)
- `/viewer` — full-screen Markdown reader

## Important Files

### App pages
```
src/app/page.tsx              — landing page (Server Component)
src/app/viewer/page.tsx       — viewer page (Client Component)
src/app/layout.tsx            — root shell: fonts, theme provider, Sonner
```

### Components
```
src/components/copy-command.tsx          — "use client" copy-to-clipboard button for npx command
src/components/theme-toggle.tsx          — light/dark toggle
src/components/viewer/
  source-switcher.tsx   — project switcher dropdown (full sidebar width, owns add/clear actions)
  file-tree.tsx         — file tree for active source only; collapse/expand-all button
  file-picker.tsx       — open folder / open files (used in empty state)
  server-panel.tsx      — local server panel (health poll, clone form, bottom of sidebar)
  markdown-view.tsx     — react-markdown renderer
  metadata-card.tsx     — frontmatter display
  toc.tsx               — table of contents (right rail)
  code-block.tsx        — shiki syntax highlighting
  shortcut-hint.tsx     — keyboard shortcut labels
```

### State & persistence
```
src/store/viewer-store.ts     — Zustand store (all viewer state + actions)
src/lib/idb.ts                — IndexedDB helpers (idb-keyval)
src/lib/local-server-client.ts — ServerClient class for http://127.0.0.1:4873
src/lib/fs.ts                 — File System Access API helpers
src/lib/markdown.ts           — parseMarkdown, extractToc
```

### Hooks
```
src/hooks/use-file-content.ts     — reads active file; branches on sourceType
src/hooks/use-keyboard-shortcuts.ts
```

---

## Type System (discriminated unions)

### ViewerFile
```ts
type BrowserViewerFile = {
  id, sourceId, sourceType: "browser-fs",
  name, relPath, dirSegments,
  handle: FileSystemFileHandle
};
type ServerViewerFile = {
  id, sourceId, sourceType: "local-server",
  name, relPath, dirSegments,
  repoId: string, serverUrl: string
};
type ViewerFile = BrowserViewerFile | ServerViewerFile;
```

### ViewerSource
```ts
type BrowserSource = {
  id, kind: "folder" | "files", name,
  directoryHandle?, fileHandles?,
  files: BrowserViewerFile[],
  permission: "granted" | "prompt" | "denied" | "unknown"
};
type LocalServerSource = {
  id, kind: "local-server", name,
  repoId, serverUrl, branch,
  files: ServerViewerFile[],
  permission: "granted",
  syncing: boolean
};
type ViewerSource = BrowserSource | LocalServerSource;
```

---

## Viewer Store — Key State

| Field | Default | Purpose |
|---|---|---|
| `sources` | `[]` | All open sources |
| `activeSourceId` | `null` | Which project is shown (project switcher) |
| `activeFileId` | `null` | Currently open file |
| `serverUrl` | `http://127.0.0.1:4873` | Local server URL |
| `serverStatus` | `"disconnected"` | Health poll result |
| `sidebarOpen` | `true` | Sidebar visibility |
| `tocOpen` | `true` | TOC rail visibility |

Key actions: `addFolder`, `addFiles`, `addServerSource`, `setActiveSource`, `removeSource`, `syncServerSource`, `setServerUrl`, `setServerStatus`

Selectors: `selectActiveFile`, `selectActiveSource`, `selectAllFiles`

---

## IDB Persistence (`lib/idb.ts`)

DB: `mdocs-db` / `mdocs-store`

| Key | Content |
|---|---|
| `sources:v1` | `StoredSource[]` — browser-fs sources with FileSystem handles |
| `serverSources:v1` | `StoredServerSource[]` — server sources (plain JSON) |
| `serverUrl:v1` | `string` — last used server URL |
| `activeFileId:v1` | `string \| null` |
| `sidebarOpen:v1` | `boolean` |
| `tocOpen:v1` | `boolean` |

---

## Local Server Client (`lib/local-server-client.ts`)

```ts
class ServerClient {
  checkHealth(): Promise<HealthResponse>    // timeout 3s
  listRepos(): Promise<RepoMeta[]>
  cloneRepo(url, branch?): Promise<RepoMeta>
  syncRepo(repoId): Promise<RepoMeta>
  listFiles(repoId): Promise<FileRef[]>
  readFile(repoId, relPath): Promise<FileContent>
  deleteRepo(repoId): Promise<void>
}
```

Types mirror `@mdocs/server` but are defined locally — never import from the server package.

---

## use-file-content Hook

`useFileContent(file: ViewerFile | null): FileContentState`

- `"browser-fs"` → reads via `FileSystemFileHandle`, polls every 2s for mtime (live reload)
- `"local-server"` → single fetch via `ServerClient.readFile()`, no polling

---

## Sidebar Layout

```
┌──────────────────────────────┐
│ [SourceSwitcher]              │  full width; dropdown has add/clear actions
├──────────────────────────────┤
│ [FileTree — active source]    │  collapse-all toggle + sync + menu
│   (scroll area)               │
├──────────────────────────────┤
│ [ServerPanel]                 │  collapsible, health poll every 10s
└──────────────────────────────┘
```

**SourceSwitcher dropdown:** source list (checkmark on active) + Add folder + Add files + Clear all  
**FileTree SourceCard header:** icon + name + branch label + [ChevronsDownUp/Up] + [RefreshCw] + [...]  
**ServerPanel (when connected):** URL edit + Clone form (GitHub URL + branch) + repo list with Add/Added

---

## File-tree collapse/expand all

Uses a React context (`CollapseContext: { gen: number; open: boolean }`). `SourceCard` increments `gen` and flips `open`. Every `FolderItem` (including nested ones) watches `gen` via `useEffect` + a `prevGen` ref and calls `setOpen(signal.open)` when `gen` changes. Individual folder clicks still work independently.

The toggle button is only shown when the source has at least one folder (`hasFolders`).

---

## Known Gotcha — Smart Quotes

The AI editor sometimes emits Unicode curly quotes (`"` `"` U+201C/201D) inside string literals. Turbopack rejects these. After writing `.ts`/`.tsx` files, run:

```powershell
Get-ChildItem "apps\frontend\src" -Recurse -Include "*.ts","*.tsx" |
  Where-Object { $_.LastWriteTime -gt (Get-Date).AddMinutes(-60) } |
  ForEach-Object {
    $c = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
    $f = $c.Replace([char]0x201C,[char]0x22).Replace([char]0x201D,[char]0x22).Replace([char]0x2018,[char]0x27).Replace([char]0x2019,[char]0x27)
    if ($c -ne $f) { [System.IO.File]::WriteAllText($_.FullName, $f, [System.Text.Encoding]::UTF8) }
  }
```

---

## Manual Test Checklist

- Folder picker opens and loads Markdown files
- Switching sources via project switcher changes file tree
- Collapse-all button collapses all folders; expand-all re-opens them
- Individual folder click still toggles independently after a collapse-all
- Server panel shows green dot when `npx mdocs serve` is running
- Clone form accepts a GitHub URL, shows loading state, adds source to tree
- Server file loads and renders in viewer
- Keyboard shortcuts: `s` sidebar, `a`/`d` prev/next within active source
- Theme toggle persists across reload
- Landing page: npx copy button copies to clipboard, check mark shows briefly
