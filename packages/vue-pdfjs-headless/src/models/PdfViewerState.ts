import type { PdfMatchesCount } from "#src/models/PdfMatchesCount";
import type { ComputedRef, Ref } from "vue";

export interface PdfViewerState {
  actualSize: () => void;
  currentPageNumber: Ref<number>;
  download: (filename: string) => void;
  fitPage: () => void;
  fitWidth: () => void;
  findNext: () => void;
  findPrevious: () => void;
  goToPage: (pageNumber: number) => void;
  isMatchCase: Ref<boolean>;
  isNotFound: Ref<boolean>;
  isWholeWord: Ref<boolean>;
  isZoomInDisabled: ComputedRef<boolean>;
  matchesCount: Ref<PdfMatchesCount>;
  nextPage: () => void;
  pagesCount: Ref<number>;
  pagesRotation: Ref<number>;
  previousPage: () => void;
  print: () => void;
  rotate: () => void;
  scale: Ref<number>;
  searchQuery: Ref<string>;
  zoomIn: () => void;
  zoomOut: () => void;
}
