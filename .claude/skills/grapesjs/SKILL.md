---
name: grapesjs
description: Esposter GrapesJS editor conventions — useGrapesJsEditor init composable, document storage adapter, block-category re-sync via setBlocks, save-time HTML/CSS capture for the webpage view page, and merge-field blocks. Apply when working on the email-editor or webpage-editor pages or GrapesJS-backed features.
---

# GrapesJS Conventions

## Initialization — Always `useGrapesJsEditor`

Never call `grapesJS.init` in a page. `useGrapesJsEditor(storage, configuration?)` (`app/composables/grapesjs/useGrapesJsEditor.ts`) owns the shared scaffolding: container (`#${GRAPES_JS_EDITOR_CONTAINER_ID}` from `app/services/grapesjs/constants.ts`), `fromElement`, `height: 100%`, the `document` storage manager, session-change re-init, and unmount cleanup (watcher stop + `editor.destroy()`). It returns `{ editor: ShallowRef<Editor | undefined> }` and is `async` (awaits the SSR-aware session) — `await` it in page setup.

- The page template renders the header + `<div :id="GRAPES_JS_EDITOR_CONTAINER_ID" flex-1 overflow-hidden />` inside `<NuxtLayout>`; GrapesJS must never mount on `.v-main` (it would ingest the header via `fromElement`).
- `storage.load`/`storage.store` delegate to the product store (`readEmailEditor`/`saveEmailEditor`, …). `store` receives `(data, editor)` so save can capture editor-derived values.

## Document Switching

The product stores guard the document-list load (`if (!currentDocument.value) await load()`), so GrapesJS storage loads after the first serve the currently selected document. Pages re-pull content with:

```ts
watch(
  () => currentDocument.value?.id,
  () => {
    editor.value?.load();
  },
);
```

`DocumentPicker` + (for publishable types) `DocumentPublishButton` live in a product `Header.vue` (`EmailEditor/Header.vue`, `WebpageEditor/Header.vue`) shown only when a session exists.

## Content Capture at Save Time

GrapesJS project data is opaque; anything derived from the live editor must be captured in the store callback, not at publish/read time:

- **Webpage** — `saveWebpageEditor(data, { css: editor.getCss(), html: editor.getHtml() })` bakes the standalone render into `WebpageEditor.css/html`; the public `/view/webpage/[id]` page serves it in a sandboxed (`sandbox="allow-scripts"`) iframe without loading GrapesJS.
- **Email** — `saveEmailEditor` re-attaches `EmailEditor.datasetReference` on every save (project data doesn't know about it).

## Custom Blocks — Re-Sync Wholesale via `setBlocks`

Blocks derived from reactive sources (dataset columns, published surveys) are re-synced with `setBlocks(editor, category, blocks)` (`app/services/grapesjs/setBlocks.ts`): it removes every block in the category, then adds the new set — no per-block bookkeeping. Watch `[editor, source]` so a session-driven editor re-init re-registers them. Block `label`s and any user text interpolated into `content` go through `escapeHtml`.

Merge fields use the canonical `toMergeField(columnName)` token (`{{columnName}}`), inserted into block content as `escapeHtml(toMergeField(columnName))` — the canvas entity-encodes special characters on serialization, so the exported HTML carries the escaped token form. `substituteMergeFields` therefore replaces **both** the raw and escaped token forms with the HTML-escaped row value. See `packages/app/content/docs/platform/email-personalization.md`.
