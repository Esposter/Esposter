---
title: Flowchart image export
description: Proposal — Flowchart becomes Portable with PNG and SVG exports of the whole diagram, rendered on the client from the canvas, so a chart can be dropped into a document or a message without publishing it.
model: claude-opus-5-5
---

# Flowchart Image Export

A diagram's most common destination is somewhere else — a slide, a document, a chat message. Today the only way out of the Flowchart editor is publishing it and sharing the link ([flowchart publish](/docs/resource/flowchart-publish)), which that page itself names as the gap: "image export of a diagram (PNG or SVG through the Portable capability) is a natural sibling but a separate decision — it needs a client-side rasterization dependency".

## What it adds

Flowchart joins `PortableResourceType` with two export-only formats in `PortableFormatMap`, so **Export PNG** and **Export SVG** appear in the resource page's overflow menu like every other portable type's exports ([resource explorer](/docs/resource/explorer)).

- **What is captured** is the whole diagram, not the viewport: the export fits the view to every node (`fitView`) on an offscreen pass, hides the minimap, controls and sidebar, and captures the Vue Flow viewport element.
- **PNG** at twice the device pixel ratio so it stays sharp on a slide; **SVG** keeps text as text.
- **Background** follows the theme at export time, with the dot grid removed, so a dark-theme export does not arrive as dark boxes on a white page.
- The file is named after the resource.

The capture uses `html-to-image`, the library Vue Flow's own screenshot example uses. It is a new dependency, so it goes through [dependency admission](/docs/architecture/dependency-admission) in the change that adds it, loaded with a dynamic `import()` inside the export so the editor's own chunk does not grow.

## What is deliberately not in it

- **No import.** A PNG cannot become nodes again, and an SVG from another tool has no node model.
- **No server-side rendering.** The canvas measures its nodes in the browser; a headless browser on the server would be an Azure cost for a button.
- **No PDF.** A PNG or SVG drops into any document that would have held the PDF.

## Key files

| File                                                    | Role after the change                        |
| ------------------------------------------------------- | -------------------------------------------- |
| `apps/web/app/services/resource/PortableFormatMap.ts`   | the PNG and SVG export formats for Flowchart |
| `apps/web/app/components/Resource/Flowchart/Editor.vue` | exposes the viewport the export captures     |

## Sources

- [Vue Flow — screenshot example source](https://github.com/bcakmakoglu/vue-flow/blob/master/examples/vite/src/Screenshot/useScreenshot.ts) — capturing the flow with `html-to-image`'s `toPng`.
