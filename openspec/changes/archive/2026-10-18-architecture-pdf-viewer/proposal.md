# PDF attachment over the renderer's own viewer

## Why

A PDF attachment mounts two wrappers over `pdfjs-dist`. `vue-pdf-embed` draws the message row's thumbnail and inlines the renderer's worker into its default entry. `@vue-pdf-viewer/viewer` draws the dialog: a closed-source viewer under a licence that forbids reading its source, running unlicensed in evaluation mode with a watermark, pinned a renderer major behind by an `overrides` entry, and bringing a headless UI library, a crypto package and a second `@vueuse/core` major. It also forces a server transpile entry, a pre-bundling exclusion, a `data:` script source and a fullscreen grant. The renderer already ships the viewer's engine as components: `pdfjs-dist/web/pdf_viewer.mjs`.

## What Changes

- The message row's thumbnail draws the first page itself, sharp at the screen's pixel density, redrawn when its width changes, and capped below the canvas size a device refuses.
- The dialog's viewer is the renderer's own `PDFViewer`, with its link service and find controller, under a toolbar of the UI library's controls: page navigation, zoom and fit, search with match count, rotation, download and print.
- A password-protected PDF asks for its password; a PDF that fails to load says so in place of its pages.
- Both PDF packages, the renderer's `overrides` entry, the transpile entries, the pre-bundling exclusion, the `data:` script source and the fullscreen grant are removed.
- The renderer's character maps, standard fonts and image decoders are served from its own install, in place of the copy of the character maps committed under `public/`.
- **BREAKING:** none for a reader. The evaluation watermark and the viewer's fullscreen, thumbnail sidebar and file-open tools go.

## Capabilities

- **architecture/pdf-viewer** (new): the viewer any PDF opens in, wherever it is shown
- **esbabbler/file-media** (modified): a PDF attachment's thumbnail, its viewer dialog and its load failure

## Waiting on

None.

## Impact

- `apps/web/app/components/Message/Model/FileRenderer/Pdf.vue` and its test, and new PDF components and services under `apps/web/app`.
- `apps/web/configuration/build.ts`, `apps/web/configuration/vite.ts`, `apps/web/configuration/security.ts`, the catalog, the `overrides`, the lockfile and `.agents/ledgers/dependencies.md`.
