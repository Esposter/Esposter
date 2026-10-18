import type { PdfApi } from "#src/models/PdfApi";
import type { PdfViewerApi } from "#src/models/PdfViewerApi";

export interface PdfRenderer {
  // The renderer's API module, its build chosen by the consumer
  api: PdfApi;
  // The base URLs the renderer's data is served from, each ending in a slash
  cMapUrl: string;
  standardFontDataUrl: string;
  // The renderer's viewer module, the components its own viewer is built from
  viewer: PdfViewerApi;
  wasmUrl: string;
  // The renderer's worker, by the URL the consumer serves it from
  workerSrc: string;
}
