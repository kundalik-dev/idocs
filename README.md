# mdocks

**Private Markdown browsing for local files and GitHub repo docs.**

mdocks is a local-first Markdown reader for developers who keep notes, specs, runbooks, and repository documentation in plain text. Open local folders, select individual Markdown files, or browse GitHub repository docs through a small local server without uploading your documents anywhere.

Documents stay on your machine. Browser file handles are stored locally in IndexedDB, and server-backed repository content is fetched from `127.0.0.1`.

## Why mdocks?

Markdown is great for writing documentation, but reading large Markdown folders and repo docs can feel scattered across editors, file explorers, and browser tabs. mdocks gives those files a focused reading surface while keeping the source files exactly where they already live.

- **Local-first by design**: no account, no cloud workspace, no document uploads.
- **Open local docs fast**: pick a folder or individual Markdown files in a Chromium browser.
- **Browse GitHub repo docs locally**: run the mdocks server, clone a public repo, and read its Markdown files in the viewer.
- **Read technical docs comfortably**: table of contents, frontmatter cards, GitHub-flavored Markdown, and Shiki-powered code highlighting.
- **Stay close to your workflow**: edit in your usual editor and refresh local files while reading.

## Try It

Run the web app locally:

```bash
pnpm install
pnpm dev
```

Then open:

```text
http://localhost:3000
```

Try the bundled blog guide in the viewer:

```text
http://localhost:3000/viewer?blog=mdocks-info
```

## Browse GitHub Repos

Browser file access is enough for local folders and files. To clone and browse GitHub repository docs, start the local mdocks server:

```bash
npx @iprep/mdocks start
```

The viewer connects to:

```text
http://127.0.0.1:5540
```

After the server is connected, paste a GitHub repository URL in the server panel and add it to your sources.

## Core Features

- Open a folder recursively and find `.md`, `.markdown`, and `.mdx` files.
- Open one or more individual Markdown files.
- Switch between browser folders, picked files, blog posts, and local-server repos.
- Render GitHub-flavored Markdown.
- Parse frontmatter and show it in a metadata card.
- Build a table of contents from headings.
- Highlight code blocks with Shiki via `rehype-pretty-code`.
- Copy code snippets with one click.
- Persist browser file handles and viewer preferences in IndexedDB.
- Refresh changed local files while the viewer is open.
- Support light and dark themes.
- Use keyboard shortcuts for sidebar, table of contents, and file navigation.

## Use Cases

| Use case | How mdocks helps |
| --- | --- |
| Local notes | Open a notes folder and browse Markdown files in one file tree. |
| Project docs | Read `README.md`, architecture notes, API docs, and runbooks in a focused viewer. |
| GitHub repo docs | Clone a public repository through the local server and browse its Markdown files. |
| Open-source projects | Give contributors a cleaner way to inspect docs-heavy repositories. |
| Private team docs | Read internal Markdown docs without moving them into another hosted platform. |
| Writing review | Edit Markdown in your editor and review rendered output in mdocks. |

## Privacy Model

mdocks is intentionally local-first.

- Selected local files are read through the browser File System Access API.
- Browser file handles are remembered in IndexedDB on your device.
- Blog posts are loaded from static Markdown files in `public/blogs`.
- The optional server runs locally on `127.0.0.1:5540`.
- Cloned repositories stay local to your machine.
- No account is required to read local files.

The hosted website may include normal analytics for page visits, but your selected document content is not uploaded by the viewer.

## Requirements

- Node.js compatible with Next.js 16
- pnpm
- A Chromium-based browser for folder and file picking, such as Chrome, Edge, Brave, or Arc

The File System Access API is browser-specific. The app can load in other browsers, but folder and file picking require `showDirectoryPicker` and `showOpenFilePicker`.

## Commands

```bash
pnpm dev              # Start the Next.js dev server
pnpm lint             # Run ESLint
pnpm exec tsc --noEmit
pnpm build            # Build for production
pnpm start            # Start the production server after building
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/blogs` | Blog listing page |
| `/viewer` | Full-screen Markdown reader |
| `/viewer?blog=mdocks-info` | Blog post opened inside the viewer |
| `/about-us` | About page |
| `/contact-us` | Contact page |
| `/privacy-policy` | Privacy page |
| `/manifest.webmanifest` | PWA manifest metadata route |
| `/robots.txt` | Robots metadata route |
| `/sitemap.xml` | Sitemap metadata route |
| `/opengraph-image` | Generated Open Graph image |

## Tech Stack

- Next.js 16.2.5 with the App Router and Turbopack
- React 19.2.4
- TypeScript 5 in strict mode
- Tailwind CSS v4
- shadcn/ui with Base UI primitives
- Zustand 5 for viewer state
- `idb-keyval` for IndexedDB persistence
- File System Access API for local files
- `react-markdown`, `remark-gfm`, `rehype-slug`, and `rehype-autolink-headings`
- Shiki and `rehype-pretty-code` for syntax highlighting
- `gray-matter` for frontmatter
- `next-themes` for light and dark mode
- Sonner for toast notifications
- Lucide React for icons

## Project Structure

```text
src/app/
  layout.tsx                 Root shell, metadata, theme provider, analytics
  page.tsx                   Landing page
  viewer/page.tsx            Full-screen Markdown reader
  viewer/layout.tsx          Viewer metadata
  about-us/page.tsx          About page
  contact-us/page.tsx        Contact page
  privacy-policy/page.tsx    Privacy page
  manifest.ts                PWA manifest metadata route
  robots.ts                  Robots metadata route
  sitemap.ts                 Sitemap metadata route
  opengraph-image.tsx        Generated Open Graph image

src/components/
  copy-command.tsx           Copy-to-clipboard command button
  theme-provider.tsx         next-themes wrapper
  theme-toggle.tsx           Light/dark toggle
  ui/                        shadcn/Base UI primitives
  viewer/                    Reader-specific UI components

src/hooks/
  use-file-content.ts        Reads active browser, server, or blog file content
  use-keyboard-shortcuts.ts  Reader keyboard shortcuts

src/lib/
  fs.ts                      File System Access helpers
  idb.ts                     IndexedDB persistence helpers
  local-server-client.ts     Local server HTTP client
  markdown.ts                Markdown parsing and TOC extraction
  utils.ts                   Shared utility helpers

src/store/
  viewer-store.ts            Zustand store for sources, files, server state, and layout

public/blogs/
  index.json                 Blog manifest used by /blogs and /viewer
  mdocks-info.md             Bundled blog guide
```

## Blog Setup

Public blog posts live in `public/blogs` and are listed in `public/blogs/index.json`.

```text
public/blogs/
  index.json
  mdocks-info.md
  2026-05-15-local-first-markdown-reader.md
```

Each post should include frontmatter:

```md
---
title: "Why mdocks is local-first"
description: "How mdocks helps you read Markdown docs without uploading files."
date: "2026-05-15"
author: "mdocks"
tags: ["markdown", "local-first", "developer-tools"]
---

# Why mdocks is local-first
```

Add every public post to `public/blogs/index.json`. The UI sorts posts newest first by `date`, and each card links to `/viewer?blog=<slug>`.

## Reader Shortcuts

| Key | Action |
| --- | --- |
| `s` | Toggle sidebar |
| `w` | Toggle table of contents |
| `a` | Previous file in the active source |
| `d` | Next file in the active source |

Shortcuts are ignored while typing in inputs or when Ctrl, Cmd, or Alt is held.

## Development Notes

This project uses Next.js 16.2.5. Before changing Next.js app code, read the relevant local docs in:

```text
node_modules/next/dist/docs/
```

Use the existing project boundaries before adding new abstractions:

- File picking and permission logic belongs in `src/lib/fs.ts`.
- Local persistence belongs in `src/lib/idb.ts`.
- Local server communication belongs in `src/lib/local-server-client.ts`.
- Viewer-wide state belongs in `src/store/viewer-store.ts`.
- Markdown parsing helpers belong in `src/lib/markdown.ts`.
- Reader UI belongs under `src/components/viewer/`.

## Roadmap Ideas

- Add polished product screenshots and a short demo GIF to this README.
- Add comparison pages for Obsidian, VS Code Markdown preview, and hosted docs tools.
- Add more example blog documents.
- Improve first-run onboarding for local folders and server-backed repos.
- Collect feedback from developers using Markdown-heavy projects.
