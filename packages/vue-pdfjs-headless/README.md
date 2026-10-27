# vue-pdfjs-headless

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Headless Vue composables over pdfjs-dist that load a document, draw its pages and track the viewer's state, with no styling and no renderer of its own.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/vue-pdfjs-headless).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i vue-pdfjs-headless
```

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

Bind `canvas` to a `<canvas ref="canvas" />` in the component's template, and the page is drawn into it.

## <a name="key-exports">🧩 Key Exports</a>

| Export              | Kind       | Purpose                                                                                                       |
| ------------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| `PdfRenderer`       | interface  | The renderer's API module, its data folder URLs and its worker, which the consumer supplies                   |
| `PdfSource`         | type       | A document by its URL, its bytes, or a file the reader picked                                                 |
| `PdfViewerState`    | interface  | The viewer's pages, zoom, rotation, search, download and print, as state and actions                          |
| `readXfdf`          | function   | Reads the free-text annotations of an XFDF file, or an error naming what is wrong with it                     |
| `usePdfAnnotations` | composable | The reader's comments and free-text annotations, exported to and imported from XFDF                           |
| `usePdfDocument`    | composable | Loads a document from a source through the consumer's renderer, with its password prompt and failure as state |
| `usePdfPage`        | composable | Draws one page of a loaded document into a canvas, at the canvas's width and the device's pixel ratio         |
| `usePdfThumbnails`  | composable | One thumbnail per page, drawn only while its row is in view of the sidebar                                    |
| `usePdfViewer`      | composable | Builds the renderer's viewer for a loaded document, with its pages, zoom and search as state                  |
| `usePdfZoomGesture` | composable | Pinch and Ctrl-wheel zoom the viewer about the pointer, keeping the content under it in place                 |
| `writeXfdf`         | function   | Writes free-text annotations as XFDF                                                                          |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=038758
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/vue-pdfjs-headless/latest?color=038758
[url-npm]: https://www.npmjs.com/package/vue-pdfjs-headless/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/vue-pdfjs-headless/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/vue-pdfjs-headless.svg
