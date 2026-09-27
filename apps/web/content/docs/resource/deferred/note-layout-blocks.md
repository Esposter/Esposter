---
title: Note layout blocks
description: Deferred — Notion's toggles, callouts and side-by-side columns in a Note; each is a custom node with its own editor and render design, worth it only once the slash menu makes a block list cheap to reach.
---

# Note Layout Blocks

Beyond text, lists, images and tables, Notion's basic blocks include blocks that shape how a page reads: **toggles** and toggle headings that fold a section away, **callouts** that set a note apart with an icon and a tint, and **columns** that put blocks side by side.

## Why deferred

None of them is in Tiptap's StarterKit, and each needs a custom node designed twice: once as an editor node view and once as the `generateHTML` output the published view sanitizes. A toggle also needs state in the published page, and columns need a drag-to-arrange interaction plus a mobile layout. That is a design and a sanitizer allowance per block. Meanwhile the writing kit, with [images](/docs/proposals/resource/note-images) and [tables](/docs/proposals/resource/note-tables), already covers the documents a single owner writes. Until the [slash menu](/docs/proposals/resource/note-slash-menu) ships, a new block would also be one more menu-bar button.

## Revisit when

The slash menu has shipped and someone asks for one of these blocks by name. That one block is proposed on its own, not the set.
