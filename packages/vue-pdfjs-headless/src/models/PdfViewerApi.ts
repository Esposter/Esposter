import type * as PdfJsViewer from "pdfjs-dist/web/pdf_viewer.mjs";

// The renderer's viewer module, the components its own viewer is built from
export type PdfViewerApi = Pick<
  typeof PdfJsViewer,
  "EventBus" | "FindState" | "LinkTarget" | "PDFFindController" | "PDFLinkService" | "PDFViewer"
>;
