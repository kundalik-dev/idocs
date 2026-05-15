---
title: "GitHub Repo Docs Browser"
description: "Use mdocks to browse Markdown documentation from GitHub repositories through a local server."
date: "2026-05-18"
author: "mdocks"
tags: ["github", "documentation", "developer-tools"]
---

# GitHub Repo Docs Browser

Many GitHub repositories have useful documentation spread across `README.md`, `docs/`, examples, changelogs, and implementation notes. mdocks helps you browse those Markdown files in one reader.

## Why browse repo docs locally?

GitHub is excellent for source control, but reading documentation across a large repository can involve a lot of tab switching. mdocks creates a focused view for Markdown files while keeping the repository local.

## How it works

Start the mdocks local server:

```bash
npx @iprep/mdocks start
```

Then open the viewer, wait for the server panel to connect, paste a GitHub repository URL, and add it to your library.

The viewer connects to:

```text
http://127.0.0.1:5540
```

## What you get

- A file tree of Markdown files from the repository.
- Rendered GitHub-flavored Markdown.
- Syntax-highlighted code blocks.
- Frontmatter display.
- Table of contents for structured documents.
- Sync support when you want to refresh the cloned repo.

## When to use it

This workflow is useful for:

- Reading documentation-heavy open-source projects.
- Reviewing docs before contributing.
- Exploring examples and guides inside a repo.
- Keeping repo documentation readable without publishing it elsewhere.

## Local-first by design

The local server exists because browsers cannot safely clone repositories by themselves. The server binds to your own machine, and cloned repositories stay local.

