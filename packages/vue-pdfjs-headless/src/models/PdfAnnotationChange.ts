import type { PdfEditorMode } from "#src/models/PdfEditorMode";

// An annotation the reader drew: the mode it was drawn in, and its page, one-based as the viewer counts pages
export interface PdfAnnotationChange {
  kind: PdfEditorMode;
  pageNumber: number;
}
