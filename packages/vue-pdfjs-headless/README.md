# vue-pdfjs-headless

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

This package provides headless Vue composables over pdfjs-dist. The composables load a document, draw its pages and track the viewer's state, with no styling and no renderer of their own.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/vue-pdfjs-headless).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

1. Install the package.

```bash
pnpm i vue-pdfjs-headless
```

2. Add this code to the `<script setup>` of a component.

```ts
import * as pdfjs from "pdfjs-dist";
import { shallowRef } from "vue";
import { usePdfDocument, usePdfPage } from "vue-pdfjs-headless";

const canvas = shallowRef<HTMLCanvasElement>();
const { pdfDocument } = usePdfDocument({
  renderer: {
    api: pdfjs,
    cMapUrl: "/cmaps/",
    standardFontDataUrl: "/fonts/",
    wasmUrl: "/wasm/",
    workerSrc: "/pdf.worker.mjs",
  },
  source: "/document.pdf",
});
usePdfPage({ canvas, pageNumber: 1, pdfDocument });
```

3. Bind `canvas` to a `<canvas ref="canvas" />` in the template. The first page appears in the canvas.

## <a name="key-exports">🧩 Key Exports</a>

| Export              | Kind       | Purpose                                                                                                        |
| ------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| `PdfRenderer`       | interface  | The renderer: its API module, its data folder URLs and its worker. The consumer supplies it.                   |
| `PdfSource`         | type       | A document, given by its URL, its bytes or a file that the reader picked                                       |
| `PdfViewerState`    | interface  | The viewer's pages, zoom, rotation, search, download and print, as state and actions                           |
| `readXfdf`          | function   | Reads the free-text annotations of an XFDF file, or returns an error that names what is wrong with it          |
| `usePdfAnnotations` | composable | Exports the reader's comments and free-text annotations to XFDF, and imports them from XFDF                    |
| `usePdfDocument`    | composable | Loads a document from a source through the consumer's renderer. Its password prompt and its failure are state. |
| `usePdfPage`        | composable | Draws one page of a loaded document into a canvas, at the canvas's width and the device's pixel ratio          |
| `usePdfThumbnails`  | composable | One thumbnail per page. A thumbnail is drawn only while its row is in view of the sidebar.                     |
| `usePdfViewer`      | composable | Builds the renderer's viewer for a loaded document. Its pages, zoom and search are state.                      |
| `usePdfZoomGesture` | composable | Zooms the viewer about the pointer on a pinch or a Ctrl-wheel. The content under the pointer stays in place.   |
| `writeXfdf`         | function   | Writes free-text annotations as XFDF                                                                           |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/vue-pdfjs-headless/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/vue-pdfjs-headless/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/vue-pdfjs-headless/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/vue-pdfjs-headless.svg
