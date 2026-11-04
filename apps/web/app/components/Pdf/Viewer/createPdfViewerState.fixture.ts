import type { PdfOutline, PdfViewerState } from "vue-pdfjs-headless";

import { vi } from "vitest";
import { PdfEditorMode } from "vue-pdfjs-headless";

// The state a viewer's components read, for a six-page document at its fitted width. Its refs hold the values a test
// Starts from, and each action is a spy a test asserts on; a test overrides what it needs
export const createPdfViewerState = (overrides: Partial<PdfViewerState> = {}): PdfViewerState => ({
  actualSize: vi.fn<() => void>(),
  currentPageNumber: ref(1),
  download: vi.fn<PdfViewerState["download"]>(),
  editorMode: ref<PdfEditorMode>(PdfEditorMode.None),
  findNext: vi.fn<() => void>(),
  findPrevious: vi.fn<() => void>(),
  fitPage: vi.fn<() => void>(),
  fitWidth: vi.fn<() => void>(),
  followBookmark: vi.fn<PdfViewerState["followBookmark"]>(),
  goToPage: vi.fn<PdfViewerState["goToPage"]>(),
  isMatchCase: ref(false),
  isNotFound: ref(false),
  isWholeWord: ref(false),
  isZoomInDisabled: computed(() => false),
  isZoomOutDisabled: computed(() => false),
  matchesCount: ref({ current: 0, total: 0 }),
  nextPage: vi.fn<() => void>(),
  outline: shallowRef<PdfOutline | undefined>([]),
  overlays: shallowRef([]),
  pagesCount: ref(6),
  pagesRotation: ref(0),
  previousPage: vi.fn<() => void>(),
  print: vi.fn<() => void>(),
  rotate: vi.fn<PdfViewerState["rotate"]>(),
  scale: ref(1.25),
  searchQuery: ref(""),
  zoomIn: vi.fn<() => void>(),
  zoomOut: vi.fn<() => void>(),
  ...overrides,
});
