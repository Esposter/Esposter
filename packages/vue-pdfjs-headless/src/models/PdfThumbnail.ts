import type { ComputedRef, Ref, ShallowRef } from "vue";

// A page's row in a thumbnail sidebar: its canvas, whether the row is in view, and whether it is the current page
export interface PdfThumbnail {
  canvas: ShallowRef<HTMLCanvasElement | undefined>;
  isCurrent: ComputedRef<boolean>;
  isVisible: Ref<boolean>;
  pageNumber: number;
}
