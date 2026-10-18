# Code view over CodeMirror's own view

## Why

A code attachment mounts CodeMirror through `vue-codemirror`, a wrapper with no release since 2022. It applies a default setup of its own, binds a two-way model the read-only view never writes, registers a global config plugin, and offers a prop for each thing CodeMirror already expresses as an extension. One of its open defects reaches this app: the editor's element is removed the moment the component unmounts, so a dialog closing around an attachment fades out empty.

## What Changes

- The code attachment mounts CodeMirror's view itself: the text is its document from the start, the view is read-only, and the grammar is swapped in place when it loads.
- The view is destroyed when the attachment is removed, and the attachment's text stays in place while a leave transition runs.
- `vue-codemirror` leaves the catalog and the dependency ledger.
- Every `vue-codemirror` issue gets a verdict on the code viewer's page.

## Capabilities

- **esbabbler/code-viewer** (modified)

## Waiting on

None.

## Impact

- `apps/web/app/components/Message/Model/FileRenderer/Code.vue` and a test beside it.
- `apps/web/app/composables/codemirror/useExtensions.ts`, inlined into its one caller.
- The catalog, the lockfile and `.agents/ledgers/dependencies.md`.
