import type { PdfFreeTextEntry } from "#src/models/PdfFreeTextEntry";

import { PdfEditorMode } from "#src/models/PdfEditorMode";

interface CreateFreeTextEntryParameters {
  color: number[];
  fontSize: number;
  id: string;
  pageIndex: number;
  rect: [number, number, number, number];
  value: string;
}

// The entry the renderer's annotation storage saves as a free-text annotation, written under the editor key prefix
export const createFreeTextEntry = ({
  color,
  fontSize,
  id,
  pageIndex,
  rect,
  value,
}: CreateFreeTextEntryParameters): PdfFreeTextEntry => ({
  annotationElementId: id,
  annotationType: PdfEditorMode.FreeText,
  color,
  deleted: false,
  fontSize,
  id,
  pageIndex,
  rect,
  rotation: 0,
  value,
});
