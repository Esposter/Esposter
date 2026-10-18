# PDF annotations in the headless package

## Why

The PDF viewer package's first change gives it loading, page drawing and the viewer's state. What a document holds beyond its pages is left out: its forms, its annotations and the comments readers leave on it. The audit of the two wrappers the app replaced set those features aside as the consuming app's, which names no dependency. A viewer package owes them, and they share one model, the renderer's annotation storage, which is written out by one save.

## What Changes

- **Forms** are filled through the renderer's annotation layer and kept in the saved bytes.
- **Annotation editing** sets the renderer's editor mode (free text, ink, highlight and stamp) and reports every change as an event.
- **Comments** are PDF text annotations, listed per document and added at a point on a page.
- **XFDF**, the annotation exchange format, is read and written by a framework-free `/xfdf` subpath.
- **A download carries what was edited.** Once anything has changed or a watermark is set, the download is the saved bytes rather than the original, with the watermark written into every page before that save.

## Capabilities

- **vue-pdfjs-headless/annotations** (new)

## Waiting on

- [PDF viewer as a headless package](../archive/2026-10-18-architecture-pdf-viewer-package/proposal.md), which creates the package, its document loading and its viewer.

## Impact

- `vue-pdfjs-headless`, which gains the annotation composable and the `/xfdf` subpath.
- The app changes nothing a reader sees: its dialog draws none of these controls.
