# Claude Project Context

Read this file first when you are the next AI assistant working on this repo.

## Project Summary

This project is **iDocs**, a local-first Markdown reader. It lets users open folders or individual Markdown files from their own machine and read them in a polished browser UI. Documents stay local; the app uses the browser File System Access API and IndexedDB instead of uploading files to a backend.

The main app routes are:

- `/` - landing page with product overview and entry points
- `/viewer` - full-screen Markdown reader

## Non-Negotiable Repo Instruction

`AGENTS.md` says this is not the Next.js you may know from training data. This repo uses Next.js 16.2.4, and APIs/conventions may have breaking changes.

Before editing Next.js app code, read the relevant docs from:

```text
node_modules/next/dist/docs/
```

Do not rely only on older Next.js memory.

## Stack

- Next.js 16.2.4, App Router
- React 19.2.4
- TypeScript 5, strict mode
- Tailwind CSS v4
- shadcn/ui with Base UI primitives
- Zustand for viewer state
- `idb-keyval` for IndexedDB persistence
- File System Access API for local files
- `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`
- Shiki for syntax highlighting
- `gray-matter` for frontmatter
- `next-themes` for light/dark mode
- Sonner for toasts
- Lucide React for icons

## Commands

Use pnpm.

```bash
pnpm install
pnpm dev
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Development URL:

```text
http://localhost:3000
```

Viewer URL:

```text
http://localhost:3000/viewer
```

Manual browser testing should use Chrome, Edge, Brave, or another Chromium browser because folder/file picking depends on the File System Access API.

## Important Files

```text
src/app/layout.tsx
```

Root app shell. Sets fonts, theme provider, tooltip provider, and Sonner toaster.

```text
src/app/page.tsx
```

Landing page for iDocs.

```text
src/app/viewer/page.tsx
```

Main reader page. Coordinates sidebar, active file loading, Markdown parsing, metadata card, rendered content, and TOC rail.

```text
src/lib/fs.ts
```

File System Access API helpers. Owns folder/file pickers, permission checks, Markdown extension filtering, recursive directory walking, and file reads.

```text
src/lib/idb.ts
```

IndexedDB persistence for selected sources, active file id, and sidebar state.

```text
src/lib/markdown.ts
```

Markdown helper layer. Parses frontmatter, extracts TOC headings, and creates snippets.

```text
src/store/viewer-store.ts
```

Zustand store. Owns source lists, active file selection, sidebar state, hydration from IndexedDB, permission re-request flows, source refresh, and clear-all behavior.

```text
src/hooks/use-file-content.ts
```

Reads the active file and polls for changes.

```text
src/hooks/use-keyboard-shortcuts.ts
```

Handles reader shortcuts: `s`, `a`, and `d`.

```text
src/components/viewer/
```

Reader UI components: file picker, file tree, Markdown renderer, metadata card, code block renderer, TOC, shortcut hints.

```text
public/docs/
```

Demo Markdown content for testing the viewer. `PROGRESS.md` also tracks implementation progress and browser-only verification tasks.

## Current Behavior

The viewer can:

- Pick a folder and recursively find Markdown files.
- Pick individual Markdown files.
- Persist selected handles in IndexedDB.
- Restore sources after reload when browser permissions allow it.
- Render Markdown content and frontmatter.
- Build a right-side table of contents from headings.
- Show syntax-highlighted code blocks with copy controls.
- Poll active files for edits and refresh content.
- Toggle theme.
- Navigate with keyboard shortcuts.

## Manual Test Checklist

Run the dev server, open `/viewer`, and use `public/docs/` as a test folder.

Check:

- Folder picker opens and loads Markdown files.
- Individual file picker opens and loads files.
- Markdown renders correctly.
- Frontmatter appears in the metadata card.
- Code highlighting works.
- Copy-code button writes to clipboard.
- TOC links and active scroll state work.
- `s` toggles sidebar.
- `a` and `d` move between files.
- Editing a Markdown file refreshes the viewer within a few seconds.
- Reloading the browser restores previous sources when permissions are still granted.
- Light/dark toggle works.

## Development Guidance

- Keep changes small and follow existing file ownership.
- Keep browser-only APIs in client components or helper modules called from the client.
- Avoid moving File System Access logic out of `src/lib/fs.ts` unless there is a clear reason.
- Avoid duplicating persistence logic outside `src/lib/idb.ts`.
- Use Lucide icons for toolbar/buttons when possible.
- Preserve the local-first privacy model. Do not add uploads or server persistence unless explicitly asked.
- If adding viewer features, update `public/docs/PROGRESS.md` or README notes when useful.

## Known Caveats

- File System Access API support is required for the core local-file workflow.
- Some browser behaviors require real manual testing; automated build/lint checks are not enough.
- Persisted file handles may require permission re-grant after reload or browser restart.
