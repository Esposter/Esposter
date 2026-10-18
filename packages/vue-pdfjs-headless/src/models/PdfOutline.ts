import type { PDFDocumentProxy } from "pdfjs-dist";

// The document's own outline, read once it loads, as its bookmarks
export type PdfOutline = NonNullable<Awaited<ReturnType<PDFDocumentProxy["getOutline"]>>>;
