import type { PageViewport } from "pdfjs-dist";

// A rendered page's element, and the viewport converting a rectangle in its PDF coordinates to the screen
export interface PdfPageOverlay {
  element: HTMLElement;
  pageNumber: number;
  viewport: PageViewport;
}
