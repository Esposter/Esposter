import type { PdfMatchesCount } from "#src/models/PdfMatchesCount";
import type { PdfOutline } from "#src/models/PdfOutline";
import type { PdfPageOverlay } from "#src/models/PdfPageOverlay";
import type { ComputedRef, Ref, ShallowRef } from "vue";

export interface PdfViewerState {
  actualSize: () => void;
  currentPageNumber: Ref<number>;
  download: (filename: string) => void;
  findNext: () => void;
  findPrevious: () => void;
  fitPage: () => void;
  fitWidth: () => void;
  followBookmark: (item: PdfOutline[number]) => void;
  goToPage: (pageNumber: number) => void;
  isFullscreen: Ref<boolean>;
  isMatchCase: Ref<boolean>;
  isNotFound: Ref<boolean>;
  isWholeWord: Ref<boolean>;
  isZoomInDisabled: ComputedRef<boolean>;
  matchesCount: Ref<PdfMatchesCount>;
  nextPage: () => void;
  outline: ShallowRef<PdfOutline>;
  overlays: ShallowRef<PdfPageOverlay[]>;
  pagesCount: Ref<number>;
  pagesRotation: Ref<number>;
  previousPage: () => void;
  print: () => void;
  rotate: () => void;
  scale: Ref<number>;
  searchQuery: Ref<string>;
  toggleFullscreen: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}
