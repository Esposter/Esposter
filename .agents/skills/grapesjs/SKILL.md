---
name: grapesjs
description: Apply when working on Resource/Email/Editor.vue, Resource/Webpage/Editor.vue, their View.vue renders, the emailEditor/webpageEditor stores, or any GrapesJS-backed feature. Esposter GrapesJS editor conventions — useGrapesJsEditor init composable, the resource-backed storage adapter, the FileAssets upload adapter, block-category re-sync via setBlocks, save-time HTML/CSS capture for the published views, and merge-field/survey-invite blocks.
---

# GrapesJS Conventions

## Where the editors live

There are no editor **pages** — an editor is a component the generic resource routes mount, so a new editor type costs a component rather than a route and a picker of its own:

- `apps/web/app/components/Resource/Email/Editor.vue`
- `apps/web/app/components/Resource/Webpage/Editor.vue`
- `apps/web/app/components/Resource/Webpage/View.vue` and `Resource/Email/View.vue` — the public read-only renders

## Initialization — Always `useGrapesJsEditor`

Never `grapesJS.init` in a component — `await useGrapesJsEditor(type, storage, configuration?, assets?)` owns the container, storage, re-init and teardown; the container holds nothing else, and the upload adapter is always passed (`references/initialization.md`).

## Resource Resolution — No Document Picker

An editor never picks its resource: its store holds only content, built on `createContentData`, and takes the row from `useResourceStore`; a content class is rebuilt from the project data plus the row's own metadata (`references/resource-resolution.md`).

## Content Capture at Save Time

What a published view renders is captured in the store callback at save time — Webpage's HTML and CSS, Email's compiled MJML through `getEmailHtml` — never at read time (`references/save-capture.md`).

## Custom Blocks — Re-Sync Wholesale via `setBlocks`

Reactive blocks re-sync wholesale through `setBlocks`, their markup lives in a `create*Blocks` service with user text escaped, and a merge field is `toMergeField(column)` (`references/blocks.md`).

## Reference pages

- `references/initialization.md` — when an editor creates its instance, storage adapter or asset upload.
- `references/resource-resolution.md` — when an editor needs its resource or content, or rebuilds a content class.
- `references/save-capture.md` — when a published view needs HTML or CSS from the live editor.
- `references/blocks.md` — when adding or re-syncing blocks, or writing a block's markup.
