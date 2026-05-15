---
title: "Private Markdown Viewer"
description: "A private way to read Markdown files, folders, and repo docs without moving documents into a hosted workspace."
date: "2026-05-17"
author: "mDocks"
tags: ["privacy", "markdown", "local-first"]
---

# Private Markdown Viewer

Private documentation should not need to leave your machine just to become readable. mDocks is built for Markdown files that already live in local folders or local repository clones.

## The problem with hosted readers

Hosted documentation tools are useful for publishing, collaboration, and team portals. But they can be too much when you simply want to read private Markdown files. Uploading notes, specs, runbooks, or internal docs can add unnecessary friction and privacy concerns.

mDocks focuses on reading, not hosting.

## What stays local

- Browser-picked files are read directly from your machine.
- File handles are stored in IndexedDB.
- The optional repository server runs on `127.0.0.1`.
- Cloned repositories stay on your computer.

## What mDocks is good for

Use it for:

- Private project notes
- Internal technical docs
- Local runbooks
- Architecture drafts
- Markdown folders you do not want to upload
- Repository documentation you want to browse locally

## What mDocks is not

mDocks is not trying to replace your editor, Git workflow, or public documentation site. It gives Markdown files a calmer reading interface while keeping your source documents where they already live.

## Simple privacy promise

If you open a local Markdown folder in mDocks, the viewer reads it locally. That is the point: private Markdown reading without a cloud workspace.
