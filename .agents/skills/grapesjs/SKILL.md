---
name: grapesjs
description: Apply when working on Resource/Email/Editor.vue, Resource/Webpage/Editor.vue, their View.vue renders, or the emailEditor/webpageEditor stores. Esposter's page-builder-backed resource editors — components the resource routes mount, never pages.
---

# Resource Editor Conventions

## Where the editors live

There are no editor **pages** — an editor is a component the generic resource routes mount, so a new editor type costs a component rather than a route and a picker of its own:

- `apps/web/app/components/Resource/Email/Editor.vue`
- `apps/web/app/components/Resource/Webpage/Editor.vue`
- `apps/web/app/components/Resource/Webpage/View.vue` and `Resource/Email/View.vue` — the public read-only renders

## Initialization — Mount the Page Builder

An editor component mounts `PageBuilderEditor` with its kind and resource id, and wires autosave to its document; it never builds a canvas of its own (`references/initialization.md`).

## Resource Resolution — No Document Picker

An editor never picks its resource: its store holds only content, built on `createContentData`, and takes the row from `useResourceStore`; a content class is rebuilt from the project data plus the row's own metadata (`references/resource-resolution.md`).

## Content Capture at Save Time

What a published view renders is captured in the store callback at save time — Webpage's HTML and CSS, Email's compiled MJML through `getEmailHtml` — never at read time (`references/save-capture.md`).

## Custom Nodes — Built by `create*Node`

A merge field is a text node from `createMergeFieldNode`, its token is `toMergeField(column)`, and the bound columns reach the palette through `useMergeFieldColumns` (`references/blocks.md`).

## Reference pages

- `references/initialization.md` — when an editor mounts the page builder or wires its autosave.
- `references/resource-resolution.md` — when an editor needs its resource or content, or rebuilds a content class.
- `references/save-capture.md` — when a published view needs HTML or CSS from the live editor.
- `references/blocks.md` — when adding merge fields or survey invites, or writing a node a palette item inserts.
