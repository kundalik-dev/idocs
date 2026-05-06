# iDocs

iDocs is a local-first Markdown reader built with Next.js. It opens Markdown files directly from the user's machine, renders them in a polished reading view, and keeps everything private in the browser. No documents are uploaded to a server.

The app currently includes a landing page at `/` and the main reader at `/viewer`.

## What It Does

- Opens a folder recursively and finds `.md`, `.markdown`, and `.mdx` files.
- Opens one or more individual Markdown files.
- Groups selected folders/files in a sidebar file tree.
- Renders Markdown with GitHub-flavored Markdown support.
- Parses frontmatter and displays it in a metadata card.
- Builds a table of contents from headings.
- Highlights code blocks with Shiki and adds copy buttons.
- Persists selected file handles, active file, and sidebar state in IndexedDB.
- Auto-refreshes changed files while the viewer is open.
- Supports light and dark themes.
- Provides keyboard shortcuts for the reader.

## Tech Stack

- Next.js 16.2.4 with the App Router
- React 19.2.4
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui components using Base UI primitives
- Zustand for viewer state
- IndexedDB via `idb-keyval`
- File System Access API for local files
- `react-markdown`, `remark-gfm`, `rehype-slug`, and `rehype-autolink-headings`
- Shiki for syntax highlighting
- `gray-matter` for frontmatter parsing
- `next-themes` for theme switching
- Sonner for toast notifications

## Requirements

- Node.js compatible with Next.js 16
- pnpm
- A Chromium-based browser for local folder/file access, such as Chrome, Edge, Brave, or Arc

The File System Access API is browser-specific. The app can load, but folder and file picking will not work in browsers that do not expose `showDirectoryPicker` and `showOpenFilePicker`.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

Then click **Open viewer** or visit:

```text
http://localhost:3000/viewer
```

For a quick self-test, open the `public/docs/` folder in the viewer.

## Scripts

```bash
pnpm dev      # Start the Next.js dev server
pnpm build    # Build for production
pnpm start    # Start the production server after building
pnpm lint     # Run ESLint
```

TypeScript checking can be run manually:

```bash
pnpm exec tsc --noEmit
```

## Project Structure

```text
src/app/
  layout.tsx          Root layout, theme provider, tooltip provider, toaster
  page.tsx            Landing page
  viewer/page.tsx     Main Markdown reader screen

src/components/
  theme-provider.tsx  next-themes wrapper
  theme-toggle.tsx    Light/dark toggle
  ui/                 shadcn/ui generated components
  viewer/             Reader-specific UI pieces

src/hooks/
  use-file-content.ts       Reads and polls active file content
  use-keyboard-shortcuts.ts Reader keyboard shortcuts

src/lib/
  fs.ts              File System Access helpers and directory walking
  idb.ts             IndexedDB persistence helpers
  markdown.ts        Frontmatter parsing and TOC extraction
  utils.ts           Shared utility helpers

src/store/
  viewer-store.ts    Zustand store for sources, active file, permissions, sidebar state

public/docs/
  GETTING_STARTED.md Demo/user guide document
  PROGRESS.md        Build progress tracker and smoke-test document
```

## Reader Shortcuts

| Key | Action |
| --- | --- |
| `s` | Toggle sidebar |
| `a` | Previous file |
| `d` | Next file |

Shortcuts are ignored while typing in inputs or when Ctrl, Cmd, or Alt is held.

## Important Development Notes

This project uses Next.js 16, and the local `AGENTS.md` warns that this version has breaking changes compared with older Next.js versions. Before changing Next.js app code, read the relevant guide in:

```text
node_modules/next/dist/docs/
```

Use the existing patterns before adding new abstractions. In particular:

- Keep file picking and permission logic in `src/lib/fs.ts`.
- Keep local persistence details in `src/lib/idb.ts`.
- Keep viewer-wide state in `src/store/viewer-store.ts`.
- Keep Markdown parsing helpers in `src/lib/markdown.ts`.
- Keep reader UI components under `src/components/viewer/`.

## Current Status

The core scaffold is implemented. `public/docs/PROGRESS.md` tracks completed work and browser-only checks that still need manual verification, including file picker dialogs, copy-to-clipboard, scroll spy behavior, keyboard shortcuts, auto-refresh, IndexedDB persistence, and theme switching.
