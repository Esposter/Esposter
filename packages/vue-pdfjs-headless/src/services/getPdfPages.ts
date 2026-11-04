import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

// Every page of a loaded document, in page order. The document keeps each proxy it hands out for its life, so a caller
// Releases the pages it has read
export const getPdfPages = (pdfDocument: PDFDocumentProxy): Promise<PDFPageProxy[]> =>
  Promise.all(Array.from({ length: pdfDocument.numPages }, (_value, pageIndex) => pdfDocument.getPage(pageIndex + 1)));
