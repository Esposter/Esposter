# PDF viewer as a headless package

## Why

The PDF viewer holds two layers. One is the app's look: the toolbar drawn with the UI library and the dialog it sits in. The other is the state any Vue viewer over `pdfjs-dist` needs: loading a document with its password and failure paths, drawing a page sharp and within the canvas a device allows, and driving the renderer's viewer through its page, zoom, rotation, search, download and print. That second layer is what both wrappers it replaced were for. Kept inside the app, it serves one dialog.

The audit's feature rows show the cost. Twenty requested features were marked out of scope as the consuming app's, and the viewer's page lists five more it does not carry yet. "The consuming app" names no dependency, so it is not an owner: a viewer package owes them. Among them are loading progress, overlays on each page, pinch zoom, range loading, forms, highlighting, bookmarks and a thumbnail sidebar, annotation editing with its events, comments, XFDF, a watermarked download, fullscreen and opening a local file.

## What Changes

- **A new published package, `vue-pdfjs-headless`, with no styling.**
  - `usePdfDocument` loads a document, with its password prompt and its failure as state.
  - `usePdfPage` draws one page into a canvas the consumer renders.
  - `usePdfViewer` drives the renderer's own viewer components, with the toolbar's state and actions.
  - The `/xfdf` subpath holds the annotation format's reader and writer, framework-free.
- **The renderer is the consumer's.** The package takes the renderer's module and its data folders as options, so a consumer chooses the build and where its folders are served. This also answers the old-browser worker rows.
- **The app's thumbnail and viewer keep only their look.** They are the canvas, the pages' container and the toolbar, in the app's tokens.
- **Every set-aside feature ships with a test.**
- **The two Upstream tables move** to the package's own README with its requirements, leaving the PDF viewer's page to describe the app's side.

## Capabilities

The app's PDF behaviour stays as it is. The new package's README is its record.

## Waiting on

None.

## Impact

- `vue-pdfjs-headless`, new, and an app dependency on it through the workspace.
- `apps/web/app/components/Pdf/` and `apps/web/app/services/pdf/`, whose loading, drawing and viewer state move into the package.
- `openspec/specs/architecture/pdf-viewer/design.md` and the new area README.
