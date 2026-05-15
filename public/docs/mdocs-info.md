---
title: mDocks Demo Guide
description: A guided tour of mDocks features, workflows, and practical use cases
date: 2026-05-14
tags: [mDocks, markdown, local-first, demo]
---

# mDocks Demo Guide

mDocks is a **local-first Markdown reader** for people who keep notes, docs, specs, runbooks, and repository documentation in plain text.

It opens Markdown from your machine or from GitHub repositories cloned through a small local server. The goal is simple: read technical documents in a polished viewer without uploading private files anywhere.

> Documents stay on your machine. Browser-picked files are read locally, and the optional server binds to `127.0.0.1`.

## What mDocks is for

mDocks is useful when your Markdown files are scattered across folders, projects, and repositories, but you want one calm place to read them.

Common use cases:

| Use case              | How mDocks helps                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------- |
| Personal notes        | Open a notes folder and browse every `.md` file in one file tree.                        |
| Project documentation | Read `README.md`, architecture notes, and implementation plans with syntax highlighting. |
| GitHub repo docs      | Run the local server, clone a public repo, and browse its Markdown files in the viewer.  |
| Developer handbooks   | Keep onboarding guides, checklists, and runbooks readable without a hosted docs site.    |
| Offline reading       | Reopen remembered local sources and keep reading without a network connection.           |
| Writing review        | Edit Markdown in your editor and see local file changes refresh in mDocks.               |

## The recommended flow

Start with the simplest path: open local files directly in the browser.

1. Open the mDocks viewer.
2. Choose **Open folder** if your docs live inside one project or notes directory.
3. Choose **Open files** if you only want to read a few Markdown files.
4. Select a file from the sidebar.
5. Read with headings, code blocks, frontmatter, and a table of contents rendered for you.

For GitHub repositories, use the optional local server:

```bash
npx @iprep/mdocks start
```

Then return to the viewer, wait for the server panel to show as connected, paste a GitHub repository URL, and add the repo to your library.

## Two ways to open documents

### 1. Browser files

Use this mode when documents already exist on your computer.

- No install is required.
- Works through the browser File System Access API.
- Best for local notes, project docs, drafts, and writing workflows.
- Local changes can refresh automatically while you edit.

This mode requires a Chromium browser such as Chrome, Edge, Brave, or Arc.

### 2. Local server and GitHub repos

Use this mode when you want to read documentation from a GitHub repository.

- Start the server with `npx @iprep/mdocks start`.
- The viewer connects to `http://127.0.0.1:5540`.
- Paste a GitHub URL and optional branch.
- mDocks clones the repo locally and adds its Markdown files to the sidebar.

The server is local. It is there to do things a browser cannot safely do by itself, such as cloning repositories.

## Reading experience

The viewer is designed for long-form technical reading.

- **Sidebar**: shows the active source and its file tree.
- **Project switcher**: moves between folders, picked files, and cloned repos.
- **Table of contents**: follows document headings when a file has structure.
- **Frontmatter card**: displays metadata from the `---` block at the top of a file.
- **Code highlighting**: uses Shiki for readable code blocks.
- **Copy buttons**: let you copy code snippets quickly.
- **Theme toggle**: switches between light and dark mode and remembers your choice.

## Keyboard shortcuts

| Shortcut | Action                                      |
| -------- | ------------------------------------------- |
| `s`      | Toggle the sidebar                          |
| `a`      | Open the previous file in the active source |
| `d`      | Open the next file in the active source     |

Use the project switcher when you want to jump between different folders or repositories. Use the file tree when you want to stay inside the current project.

## Example workflow: local project docs

Imagine you have this project structure:

```text
my-app/
  README.md
  docs/
    architecture.md
    api.md
    deployment.md
  notes/
    release-plan.md
```

In mDocks:

1. Click **Open folder**.
2. Pick `my-app`.
3. Open `README.md` from the sidebar.
4. Use the table of contents to jump between sections.
5. Edit `docs/api.md` in your editor.
6. Return to mDocks and continue reading after the content refreshes.

## Example workflow: GitHub documentation

When the docs live in a repository:

1. Start the local server.
2. Open the server panel in mDocks.
3. Paste a repository URL, for example:

```text
https://github.com/owner/repo
```

4. Add the repo.
5. Browse `README.md`, `docs/`, and other Markdown files from the same viewer.
6. Sync the repo when you want to refresh it.

## Privacy model

mDocks is intentionally local-first.

- It does not upload your selected files.
- It does not require an account.
- Browser file handles are stored locally in IndexedDB.
- The optional server runs on your own machine.
- Cloned repositories stay local.

If you are reading private or internal documentation, this model keeps the reading workflow close to your filesystem instead of moving documents into a hosted service.

## What this demo document shows

This file is also a test document for the viewer. It includes:

- Frontmatter metadata
- Multiple heading levels
- Tables
- Lists
- Blockquotes
- Code blocks
- Inline code

That means you can use it to confirm the reading layout, table of contents, metadata card, and syntax highlighting.

## Quick checklist

Use this checklist the first time you try mDocks:

- [ ] Open the viewer.
- [ ] Pick a local folder with Markdown files.
- [ ] Switch between files from the sidebar.
- [ ] Toggle the table of contents by opening a document with headings.
- [ ] Copy a code block.
- [ ] Change the theme.
- [ ] Run `npx @iprep/mdocks start` if you want to add GitHub repositories.

## Final note

mDocks is not trying to replace your editor, Git workflow, or documentation site. It gives Markdown files a focused reading surface while keeping your source files exactly where they already live.
