import type { PdfLoadingProgress } from "#src/models/PdfLoadingProgress";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { Ref, ShallowRef } from "vue";

export interface PdfDocumentState {
  isFailed: Ref<boolean>;
  isPasswordRequested: Ref<boolean>;
  isPasswordWrong: Ref<boolean>;
  pdfDocument: ShallowRef<PDFDocumentProxy | undefined>;
  progress: Ref<PdfLoadingProgress>;
  submitPassword: (password: string) => void;
}
