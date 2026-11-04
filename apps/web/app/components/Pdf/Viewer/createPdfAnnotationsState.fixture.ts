import type { PdfAnnotationsState, PdfComment } from "vue-pdfjs-headless";

import { ok } from "neverthrow";
import { vi } from "vitest";

// The annotations a viewer's components read, for a document with no comments read yet. Each action is a spy a test
// Asserts on, and a test overrides what it needs
export const createPdfAnnotationsState = (overrides: Partial<PdfAnnotationsState> = {}): PdfAnnotationsState => ({
  comments: shallowRef<PdfComment[] | undefined>([]),
  exportXfdf: vi.fn<() => string>(() => ""),
  importXfdf: vi.fn<PdfAnnotationsState["importXfdf"]>(() => ok(undefined)),
  setEditorMode: vi.fn<PdfAnnotationsState["setEditorMode"]>(),
  ...overrides,
});
