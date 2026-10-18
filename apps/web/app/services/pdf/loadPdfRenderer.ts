import type { PdfRenderer } from "vue-pdfjs-headless";

import { PDF_CMAP_BASE_URL, PDF_STANDARD_FONT_DATA_BASE_URL, PDF_WASM_BASE_URL } from "@/services/pdf/constants";
import { loadPdfViewer } from "@/services/pdf/loadPdfViewer";
import PdfWorker from "pdfjs-dist/build/pdf.worker?url";

// The renderer's modules are imported here rather than at the module's top, so a server render never evaluates them.
// Its worker is the app's own copy from the same install, so the worker, the API and the viewer cannot drift apart
export const loadPdfRenderer = async (): Promise<PdfRenderer> => {
  const [api, viewer] = await Promise.all([import("pdfjs-dist"), loadPdfViewer()]);

  return {
    api,
    cMapUrl: PDF_CMAP_BASE_URL,
    standardFontDataUrl: PDF_STANDARD_FONT_DATA_BASE_URL,
    viewer,
    wasmUrl: PDF_WASM_BASE_URL,
    workerSrc: PdfWorker,
  };
};
