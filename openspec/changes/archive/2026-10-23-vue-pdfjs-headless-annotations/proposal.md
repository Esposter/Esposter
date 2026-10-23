# PDF annotations in the headless package

## Why

The PDF viewer package's first change gives it loading, page drawing and the viewer's state. What a document holds beyond its pages is left out: its forms, its annotations and the comments readers leave on it. The audit of the two wrappers the app replaced set those features aside as the consuming app's, which names no dependency. A viewer package owes them, and they share one model, the renderer's annotation storage, which is written out by one save.

## What Changes

- **Forms** are filled through the renderer's annotation layer and kept in the saved bytes.
- **Annotation editing** sets the renderer's editor mode (free text, ink, highlight and stamp) and reports each drawn annotation as an event.
- **Comments** are listed per document. Adding them is not offered: the renderer's save writes no text annotation, which was probed against pdf.js 6.4.299.
- **XFDF**, the annotation exchange format, carries free texts, read and written by a framework-free `/xfdf` subpath.
- **A download carries what was edited.** Once anything has changed or a watermark is set, the download is the saved bytes rather than the original, with the watermark written into every page for that save alone.

## Capabilities

- **vue-pdfjs-headless/annotations** (new)

## Waiting on

None.

## Impact

- `vue-pdfjs-headless`, which gains the annotation composable, the `/xfdf` subpath, and `neverthrow` as a dependency for XFDF's results.
- The app changes nothing a reader sees: its dialog draws none of these controls.
