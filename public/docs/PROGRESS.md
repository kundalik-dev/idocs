---
title: iDocs Build Progress
description: Live tracker for the iDocs viewer scaffold. Edit me while the dev server runs to test auto-refresh.
author: Claude (with kundalik)
date: 2026-05-06
tags: [scaffold, progress, tracker]
---

# iDocs Build Progress

This file is both a **task tracker** and a **demo document** — open it from the viewer to test rendering, the table of contents, code blocks, copy-to-clipboard, frontmatter cards, and live reload.

> Tip: edit this file in your editor while the viewer is open. It should auto-refresh within a couple of seconds.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript 5
- Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- `react-markdown` + `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`
- **Shiki** for syntax highlighting (client-side `codeToHtml`)
- `gray-matter` for frontmatter
- `idb-keyval` for handle persistence
- `next-themes` for dark/light mode (default light)
- `zustand` for app state

## Tasks

### Done

- [x] Scaffold project with `pnpm create next-app`
- [x] Init shadcn/ui and add base components (button, card, sheet, scroll-area, separator, dropdown-menu, tooltip, badge, skeleton)
- [x] Install runtime deps (`react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `shiki`, `gray-matter`, `idb-keyval`, `next-themes`, `zustand`, `sonner`, `github-slugger`)
- [x] Theme provider, root layout (Inter font, default light), landing page
- [x] File System Access API helpers, IndexedDB persistence, Zustand store
- [x] Markdown renderer with Shiki dual-theme highlighting, per-block copy button, TOC extraction
- [x] Viewer page: collapsible sidebar, file tree, metadata card, content + TOC rail, keyboard shortcuts, refresh dot
- [x] Smoke-test: `pnpm lint` and `pnpm exec tsc --noEmit` both clean; `/` and `/viewer` return HTTP 200

### Verified by build only — needs human in a real browser

- [ ] File picker (folder + multi-file) actually opens system dialogs
- [ ] Markdown content renders + Shiki highlights
- [ ] Copy-code button writes to clipboard
- [ ] TOC active-section scroll-spy
- [ ] Keyboard shortcuts (`s`, `a`, `d`)
- [ ] Auto-refresh on file edit (≤2s polling)
- [ ] IndexedDB persistence across reload
- [ ] Dark / light toggle

> Open the app at `http://localhost:3000`, click **Open viewer**, point it at the `public/docs/` folder for a self-test.

## Keyboard shortcuts

| Key | Action            |
| --- | ----------------- |
| `s` | Toggle sidebar    |
| `a` | Previous file     |
| `d` | Next file         |

> Shortcuts are ignored while typing in inputs or when modifier keys (Ctrl/Cmd/Alt) are held.

## Demo: code blocks

```ts
// TypeScript — Shiki should highlight this with your theme.
type Source = {
  id: string;
  kind: "folder" | "files";
  name: string;
  files: MdFile[];
};

async function pickFolder(): Promise<FileSystemDirectoryHandle> {
  return window.showDirectoryPicker({ id: "idocs", mode: "read" });
}
```

```tsx
// React — also gets highlighted, with the copy button in the corner.
export function Hello({ name }: { name: string }) {
  return <h1 className="text-2xl font-semibold">Hi, {name}!</h1>;
}
```

```bash
# Shell snippets work too.
pnpm dev --turbopack
```

## Demo: lists & quotes

1. First, **pick a folder** containing `.md` files, or pick individual files.
2. The sidebar shows them grouped by source.
3. Click any file to read it here.

> "Stay close to the metal: the simplest stack that solves the problem is the one you should ship."

---

If you reached the end of the file, the auto-refresh, TOC, frontmatter card, and code block rendering are all working. Happy reading.
