---
title: "Local Markdown Reader"
description: "How mdocks helps you open and read Markdown folders from your own machine without uploading files."
date: "2026-05-19"
author: "mdocks"
tags: ["markdown", "local-first", "privacy"]
---

# Local Markdown Reader

Markdown files often live inside project folders, notes directories, and documentation repositories. mdocks gives those files a focused reading surface without asking you to move them into a hosted tool.

## Why local Markdown reading matters

Many Markdown workflows start in an editor, but reading long-form docs inside an editor can feel noisy. File explorers, sidebars, terminals, and open tabs are useful while writing code, but they are not always comfortable for reading architecture notes, runbooks, or product plans.

mdocks keeps the files where they already are and gives them a clean reader.

## What mdocks does

- Opens local folders through the browser File System Access API.
- Finds `.md`, `.markdown`, and `.mdx` files recursively.
- Shows files in a sidebar tree.
- Renders frontmatter, headings, tables, links, lists, and code blocks.
- Builds a table of contents from headings.
- Keeps selected file handles in local browser storage.

## Best use cases

Use mdocks when you want to read:

- Project documentation
- Personal Markdown notes
- Architecture decisions
- Release plans
- Internal runbooks
- Local knowledge bases

## Privacy model

Local files are read on your machine. The viewer does not upload selected Markdown content to a cloud workspace. This makes mdocks useful for private notes, internal documentation, and documents that should stay close to your filesystem.

## Try it

Open the viewer and choose a local folder with Markdown files. If you want a no-setup preview first, open the blog guide inside mdocks:

```text
/viewer?blog=mdocks-info
```

