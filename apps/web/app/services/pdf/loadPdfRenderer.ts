import type { PdfRenderer } from "vue-pdfjs-headless";

import { PDF_CMAP_BASE_URL, PDF_STANDARD_FONT_DATA_BASE_URL, PDF_WASM_BASE_URL } from "@/services/pdf/constants";
import PdfWorker from "pdfjs-dist/build/pdf.worker?url";

// The renderer's API is imported here rather than at the module's top, so a server render never evaluates it.
// Its worker is the app's own copy from the same install, so the worker and the API cannot drift apart.
// The viewer's components are a separate load, made by whichever viewer is shown
export const loadPdfRenderer = async (): Promise<PdfRenderer> => {
  const api = await import("pdfjs-dist");

  return {
    api,
    cMapUrl: PDF_CMAP_BASE_URL,
    standardFontDataUrl: PDF_STANDARD_FONT_DATA_BASE_URL,
    wasmUrl: PDF_WASM_BASE_URL,
    workerSrc: PdfWorker,
  };
};
