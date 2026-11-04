import type { PdfEditorMode } from "#src/models/PdfEditorMode";
import type { PdfMatchesCount } from "#src/models/PdfMatchesCount";
import type { PdfOutline } from "#src/models/PdfOutline";
import type { PdfPageOverlay } from "#src/models/PdfPageOverlay";
import type { ComputedRef, Ref, ShallowRef } from "vue";

export interface PdfViewerState {
  actualSize: () => void;
  currentPageNumber: Ref<number>;
  download: (filename: string, watermark?: string) => void;
  editorMode: Ref<PdfEditorMode>;
  findNext: () => void;
  findPrevious: () => void;
  fitPage: () => void;
  fitWidth: () => void;
  followBookmark: (item: PdfOutline[number]) => void;
  goToPage: (pageNumber: number) => void;
  isMatchCase: Ref<boolean>;
  isNotFound: Ref<boolean>;
  isWholeWord: Ref<boolean>;
  isZoomInDisabled: ComputedRef<boolean>;
  isZoomOutDisabled: ComputedRef<boolean>;
  matchesCount: Ref<PdfMatchesCount>;
  nextPage: () => void;
  outline: ShallowRef<PdfOutline | undefined>;
  overlays: ShallowRef<PdfPageOverlay[]>;
  pagesCount: Ref<number>;
  pagesRotation: Ref<number>;
  previousPage: () => void;
  print: () => void;
  resetZoom: () => void;
  rotate: (degrees: number) => void;
  scale: Ref<number>;
  searchQuery: Ref<string>;
  zoomIn: () => void;
  zoomOut: () => void;
}
