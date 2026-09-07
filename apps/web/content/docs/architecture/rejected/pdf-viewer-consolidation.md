---
title: PDF viewer consolidation
description: Rejected — dropping the full PDF viewer and rendering the dialog through the thumbnail embed, to retire the renderer override it needs.
---

# PDF Viewer Consolidation

One component renders PDFs and mounts two libraries to do it: `vue-pdf-embed` draws the first page as the thumbnail every PDF message row shows, and `@vue-pdf-viewer/viewer` mounts lazily inside the dialog that opens on a click. Consolidating meant deleting the second and rebuilding the dialog's chrome — page navigation, zoom, download, dark mode — over the embed we already ship.

The attraction was real and is worth stating, because it is the reason this looked like a backlog item at all. The full viewer declares `pdfjs-dist` a major below the one we install, as a pinned dependency **and** as a peer, and installs only because a repo-wide `overrides` entry forces it onto ours — a compatibility promise nothing but our own reading verifies, renewed on every renderer bump. It brings a headless component library and a crypto package with it, and it names itself in four config sites: a server-only transpile entry, a Vite pre-bundling exclusion, a `data:` script-source allowance, and a fullscreen permission.

## Why not

**What the full viewer does is on the stop list twice over.** Its product is a document-reading surface: virtual scrolling so a large PDF loads without rendering every page, in-document search, a table of contents, printing, XFA and AcroForm rendering, rotation, keyboard navigation, and ARIA attributes with localized tooltips. Accessibility-shaped packages are never absorbed — the part we would reimplement is the part we would not think to test — and virtual scrolling a hundred-page document is engine-shaped rather than adapter-shaped. The [admission test](/docs/proposals/refactors/dependency-reduction) refuses this at its second and third gates, before the version-lock argument is ever reached.

**The scope that made it look bounded was doing the work.** A page canvas with navigation and zoom is a weekend; it is also not what the dialog is for. Excluding search, the outline, printing and forms is only honest if nobody wants them, and a PDF read inside a chat client is exactly where someone wants to find a word in a contract. Ship the bounded version and the excluded half comes back one feature at a time, which is how a dependency cut turns into owning a document viewer.

**The override is the cheap half of the cost, not the expensive one.** It is one line, it is scoped to a package that has been upgraded without incident, and the renderer is a permanent keep regardless — PDF is a specification that changes without us, which is the stop list's first rule. Trading a verified-by-reading version pin for a reimplementation of accessibility and virtual scrolling is a worse position, not a better one.

## What stands instead

The pairing is checked rather than assumed: when the renderer major moves, the viewer is opened against a real document and the thumbnail, the page strip and text selection are looked at before the bump lands. That is the same verification the `overrides` line has always rested on, written down instead of remembered.

The embed stays where it is. It tracks the renderer major we install, it is what the row's thumbnail needs, and nothing about this decision asks it to grow.
