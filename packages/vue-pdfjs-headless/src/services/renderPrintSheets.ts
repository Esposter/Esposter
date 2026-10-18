import type { PDFDocumentProxy } from "pdfjs-dist";

import { PDF_PRINT_BATCH_SIZE, PDF_PRINT_CLASS, PDF_PRINT_STYLE } from "#src/services/constants";
import { renderPrintImage } from "#src/services/renderPrintImage";

// Draws every page of a document for print into a container only print shows, a batch at a time.
// Once isCancelled reports the print stale, it gives up without a container, so nothing is left to print or remove
export const renderPrintSheets = async (
  pdfDocument: PDFDocumentProxy,
  isCancelled: () => boolean,
): Promise<HTMLDivElement | undefined> => {
  const style = window.document.createElement("style");
  style.textContent = PDF_PRINT_STYLE;
  const printRoot = window.document.createElement("div");
  printRoot.className = PDF_PRINT_CLASS;
  printRoot.append(style);
  // The next batch starts once this one has landed, so a batch limits how many pages render at the same time.
  // Every page's image stays in the print root until afterprint, so by the end of a print every page is held there
  const renderBatch = async (firstPageNumber: number): Promise<void> => {
    if (isCancelled() || firstPageNumber > pdfDocument.numPages) return;

    const lastPageNumber = Math.min(firstPageNumber + PDF_PRINT_BATCH_SIZE - 1, pdfDocument.numPages);
    const pageNumbers = Array.from(
      { length: lastPageNumber - firstPageNumber + 1 },
      (_, index) => firstPageNumber + index,
    );
    printRoot.append(
      ...(await Promise.all(pageNumbers.map((pageNumber) => renderPrintImage(pdfDocument, pageNumber)))),
    );
    await renderBatch(lastPageNumber + 1);
  };
  await renderBatch(1);

  return isCancelled() ? undefined : printRoot;
};
