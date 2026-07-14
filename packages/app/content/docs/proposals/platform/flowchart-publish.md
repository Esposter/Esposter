---
title: Flowchart Publish
description: Flowchart opts into Publishable — a read-only VueFlow render at /view/flowchart/[id], making diagrams shareable like every other visual artifact.
---

# Flowchart Publish

Flowchart is the only visual artifact type that cannot be shared at all — no export, no public view; a diagram is visible exclusively to its logged-in owner inside the editor. Opting Flowchart into **Publishable** gives it the same share unit as Dashboard and Webpage: a public read-only render at `/view/flowchart/[id]`.

## Scope

**Today**: Flowchart declares no capabilities. Sharing a diagram means screenshotting the editor.

**This proposal adds** the capability opt-in plus one read-only view component. Nothing else — publish procedures, command bar Publish/Unpublish, snapshotting, and OG meta all arrive from the existing capability machinery.

## How it works

- `publishable: true` on Flowchart in `ResourceDefinitionMap` — the derived `PublishableResourceType` union then demands a `ViewComponentMap[Flowchart]` entry at compile time and the factory grants the publish procedures.
- **View component**: a VueFlow instance over the snapshot's nodes/edges with interaction locked down (no dragging, no connecting, no node selection — pan/zoom stays on, since large diagrams need it). Rendered under `<ClientOnly>` like the editor blade (VueFlow cannot SSR).
- The publish snapshot is the plain content copy — flowchart content references no other resources and no binary assets, so no `transformPublishedContent` hook is needed. This is the simplest possible Publishable adoption and a good template for future types.

## Key files

| File                                                             | Role                       |
| ---------------------------------------------------------------- | -------------------------- |
| `packages/app/shared/services/resource/ResourceDefinitionMap.ts` | `publishable: true`        |
| `app/components/Resource/Flowchart/View.vue` (new)               | read-only VueFlow renderer |
| `app/services/resource/ViewComponentMap.ts`                      | Flowchart entry            |

## Notes

- After this, the only non-publishable types are File, TodoList, and Email ([email web view](/docs/proposals/platform/email-web-view) covers Email). File and TodoList stay non-publishable on purpose — sharing data rows is the dataset/export path, and a todo list is personal working state; the type system guaranteeing _absence_ of publish endpoints there is a feature of the capability model, not a gap.
- Image export (PNG/SVG of the diagram, via the Portable capability) is a natural sibling but a separate decision — it needs a client-side rasterization dependency; not bundled here.
