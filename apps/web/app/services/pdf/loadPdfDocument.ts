import { PDF_CMAP_BASE_URL, PDF_STANDARD_FONT_DATA_BASE_URL, PDF_WASM_BASE_URL } from "@/services/pdf/constants";
import PdfWorker from "pdfjs-dist/build/pdf.worker?url";

// The renderer is imported here rather than at the module's top, so a server render never evaluates it. Its worker is
// The app's own copy from the same install, so the two cannot drift apart in version
export const loadPdfDocument = async (url: string) => {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc = PdfWorker;

  return getDocument({
    cMapPacked: true,
    cMapUrl: PDF_CMAP_BASE_URL,
    standardFontDataUrl: PDF_STANDARD_FONT_DATA_BASE_URL,
    url,
    wasmUrl: PDF_WASM_BASE_URL,
  });
};
