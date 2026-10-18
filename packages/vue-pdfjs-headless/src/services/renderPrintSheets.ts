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
  for (let firstPageNumber = 1; firstPageNumber <= pdfDocument.numPages; firstPageNumber += PDF_PRINT_BATCH_SIZE) {
    if (isCancelled()) return undefined;

    const lastPageNumber = Math.min(firstPageNumber + PDF_PRINT_BATCH_SIZE - 1, pdfDocument.numPages);
    const pageNumbers = Array.from(
      { length: lastPageNumber - firstPageNumber + 1 },
      (_, index) => firstPageNumber + index,
    );
    // oxlint-disable-next-line no-await-in-loop -- A batch lands before the next renders, so no print holds every page
    printRoot.append(
      ...(await Promise.all(pageNumbers.map((pageNumber) => renderPrintImage(pdfDocument, pageNumber)))),
    );
  }

  return isCancelled() ? undefined : printRoot;
};
