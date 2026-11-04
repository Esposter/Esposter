import type { PdfEditorMode } from "#src/models/PdfEditorMode";

// A free-text annotation as the renderer's annotation storage holds it, ready to be saved with the document
export interface PdfFreeTextEntry {
  annotationElementId: string;
  annotationType: PdfEditorMode.FreeText;
  color: number[];
  deleted: false;
  fontSize: number;
  id: string;
  pageIndex: number;
  rect: [number, number, number, number];
  rotation: 0;
  value: string;
}
