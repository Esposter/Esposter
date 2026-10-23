import type { PdfComment } from "#src/models/PdfComment";
import type { PdfEditorMode } from "#src/models/PdfEditorMode";
import type { Result } from "neverthrow";
import type { ShallowRef } from "vue";

export interface PdfAnnotationsState {
  comments: ShallowRef<PdfComment[]>;
  exportXfdf: () => string;
  importXfdf: (xfdf: string) => Result<void, string>;
  setEditorMode: (mode: PdfEditorMode) => void;
}
