---
title: Note Markdown portability
description: Proposal — Note becomes Portable with Markdown import and export, so a document moves in and out as a .md file through the command bar every portable type already has.
model: claude-opus-5-5
---

# Note Markdown Portability

A Note can be read only inside the app or through its published page ([note resource](/docs/resource/note-resource)); that page names Markdown export as "a natural follow-on, not bundled". Markdown is the format documents travel in — a README, a wiki, a pasted answer — and a Note that cannot leave as `.md` or arrive from one is a document you are locked into.

## What it adds

Note joins `PortableResourceType` with one Markdown format in `PortableFormatMap`, so the resource page's overflow menu gains **Import Markdown** and **Export Markdown** beside every other portable type's commands ([resource explorer](/docs/resource/explorer)).

- **Export** serializes the working copy's Tiptap JSON to Markdown and downloads `<name>.md`. Headings, lists, task lists (as `- [ ]`), marks, links, blockquotes and code blocks all have Markdown forms, so nothing the writing kit holds is lost.
- **Import** reads a `.md` file, parses it to Tiptap JSON with the same extension set, shows what it will replace, and saves it as the working copy through `saveResourceContent` — the Sheet's import-replaces-with-confirmation pattern — so the previous content stays in [version history](/docs/resource/resource-snapshots).
- **The converter is Tiptap's own** `@tiptap/markdown`, whose `MarkdownManager` parses and serializes against the editor's schema, so a Note's extensions decide what round-trips rather than a second Markdown library's idea of the document. Tiptap marks it an early release; the change pins it and adds a round-trip test over every node the writing kit has, which is what fails if a release changes the output. It is a new dependency and goes through [dependency admission](/docs/architecture/dependency-admission).

## What is deliberately not in it

- **No HTML or `.docx` export.** The published view already is the HTML form; `.docx` is a heavy dependency for a Word user who can paste the Markdown.
- **No live Markdown editing mode.** The Note is a rich-text editor; Markdown is its file format, not a second editing surface.

## Key files

| File                                                       | Role after the change                          |
| ---------------------------------------------------------- | ---------------------------------------------- |
| `apps/web/app/services/resource/PortableFormatMap.ts`      | the Markdown format for Note                   |
| `apps/web/app/services/resource/note/getNoteExtensions.ts` | the extension set the converter parses against |

## Sources

- [Tiptap — Markdown installation](https://tiptap.dev/docs/editor/markdown/getting-started/installation) — the `@tiptap/markdown` package and its `MarkdownManager` parse and serialize.
- [Tiptap — Markdown](https://tiptap.dev/docs/editor/markdown) — bidirectional support, and its early-release caveat that motivates the round-trip test.
