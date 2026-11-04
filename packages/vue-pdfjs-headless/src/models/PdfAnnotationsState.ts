import type { PdfComment } from "#src/models/PdfComment";
import type { PdfEditorMode } from "#src/models/PdfEditorMode";
import type { Result } from "neverthrow";
import type { ShallowRef } from "vue";

export interface PdfAnnotationsState {
  // Undefined until the comments are read, so a tab shows loading while they are on their way
  comments: ShallowRef<PdfComment[] | undefined>;
  exportXfdf: () => string;
  importXfdf: (xfdf: string) => Result<void, string>;
  setEditorMode: (mode: PdfEditorMode) => void;
}
