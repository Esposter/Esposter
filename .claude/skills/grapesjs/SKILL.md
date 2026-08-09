---
name: grapesjs
description: Esposter GrapesJS editor conventions — useGrapesJsEditor init composable, the resource-backed storage adapter, the FileAssets upload adapter, block-category re-sync via setBlocks, save-time HTML/CSS capture for the published views, and merge-field/survey-invite blocks. Apply when working on Resource/Email/Editor.vue, Resource/Webpage/Editor.vue, their View.vue renders, the emailEditor/webpageEditor stores, or any GrapesJS-backed feature.
---

# GrapesJS Conventions

## Where the editors live

There are no editor **pages**. The Resource Explorer consolidation replaced them with two components mounted by the generic resource routes:

- `packages/app/app/components/Resource/Email/Editor.vue`
- `packages/app/app/components/Resource/Webpage/Editor.vue`
- `packages/app/app/components/Resource/Webpage/View.vue` and `Resource/Email/View.vue` — the public read-only renders

## Initialization — Always `useGrapesJsEditor`

Never call `grapesJS.init` in a component. `useGrapesJsEditor(storage, configuration?, assets?)` (`app/composables/grapesjs/useGrapesJsEditor.ts`) owns the shared scaffolding: container (`#${GRAPES_JS_EDITOR_CONTAINER_ID}` from `app/services/grapesjs/constants.ts`), `fromElement`, `height: 100%`, the `document` storage manager, session-change re-init, and unmount cleanup (watcher stop + `editor.destroy()`). It returns `{ editor: ShallowRef<Editor | undefined> }` and is `async` (awaits the SSR-aware session) — `await` it in the editor component's setup.

- The component template gives GrapesJS its own `<div :id="GRAPES_JS_EDITOR_CONTAINER_ID" flex-1 overflow-hidden />`; it must never mount on a container that also holds a toolbar (it would ingest it via `fromElement`).
- `storage.load`/`storage.store` delegate to the product store (`readEmailEditor`/`saveEmailEditor`, …). `store` receives `(data, editor)` so save can capture editor-derived values.
- `assets` is the FileAssets upload adapter (`{ upload: (file) => Promise<string> }`). Pass it — without it GrapesJS embeds dropped images as base64 into the content blob. Build it from `useUploadResourceFile(type, () => store.resource?.id ?? "")`; the composable owns the Asset Manager `uploadFile` handler, size validation and error alerts.

## Resource Resolution — No Document Picker

There is no `currentDocument`, `DocumentPicker`, or `DocumentPublishButton` — no per-editor pickers survive the Resource Explorer consolidation. The editor stores (`app/store/emailEditor/`, `app/store/webpageEditor/`) resolve the resource from the route:

```ts
const route = useRoute();
const { load, readContent, resource, save } = useResource(() =>
  Array.isArray(route.params.id) ? (route.params.id[0] ?? "") : (route.params.id ?? ""),
);
```

The storage adapter's `load` awaits `load()` then `readContent()`, so it always serves the routed resource — no manual `editor.load()` re-pull watcher. Picking/publishing is the Resource Explorer's job; the only in-editor picker is `DatasetReferencePicker` in `Resource/Email/Editor.vue`'s toolbar, shown when a session exists.

## Content Capture at Save Time

GrapesJS project data is opaque; anything derived from the live editor must be captured in the store callback, not at publish/read time:

- **Webpage** — `saveWebpageEditor(data, { css: editor.getCss(), html: editor.getHtml() })` bakes the standalone render into `WebpageEditor.css/html`; the generic public route `app/pages/view/[type]/[id].vue` renders `Resource/Webpage/View.vue`, which serves it via `srcdoc` in a sandboxed (`sandbox="allow-scripts"`, no `allow-same-origin`) iframe without loading GrapesJS.
- **Email** — `saveEmailEditor(data, { html: getEmailHtml(editor) })` re-attaches `EmailEditor.datasetReference` and bakes the compiled MJML into `EmailEditor.html` (MJML compiles only in the client editor); `Resource/Email/View.vue` serves it through the same sandboxed iframe as Webpage. Always compile via `app/services/emailEditor/getEmailHtml.ts` — never call `runCommand("mjml-code-to-html")` directly.

## Custom Blocks — Re-Sync Wholesale via `setBlocks`

Blocks derived from reactive sources (dataset columns, published surveys) are re-synced with `setBlocks(editor, category, blocks)` (`app/services/grapesjs/setBlocks.ts`): it removes every block in the category, then adds the new set — no per-block bookkeeping. Watch `[editor, source]` so a session-driven editor re-init re-registers them. Block `label`s and any user text interpolated into `content` go through `escapeHtml`.

Survey invite blocks are shared by both editors: `createSurveyInviteBlocks` (`app/services/grapesjs/`) is the core (list → block identity + public url) and each editor passes only its button renderer (`createEmailSurveyInviteBlocks` = MJML, `createWebpageSurveyInviteBlocks` = plain HTML). The block source is `useReadPublishedSurveys`, and the watch is shared too — call `useSurveyInviteBlocks(editor, publishedSurveys, createBlocks)` (`app/composables/grapesjs/`) rather than re-writing the watch in a component.

**Never inline block markup in a component.** A block's content string lives in a `create*Blocks` service beside its siblings, which is also what makes it testable — merge fields build through `createMergeFieldBlocks` (`app/services/emailEditor/`), never inline in the editor blade.

Merge fields use the canonical `toMergeField(columnName)` token (`{{columnName}}`), inserted into block content as `escapeHtml(toMergeField(columnName))` — the canvas entity-encodes special characters on serialization, so the exported HTML carries the escaped token form. `substituteMergeFields` therefore replaces **both** the raw and escaped token forms with the HTML-escaped row value. See `packages/app/content/docs/platform/email-personalization.md`.
