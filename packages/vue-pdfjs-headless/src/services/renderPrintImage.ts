import type { PDFDocumentProxy } from "pdfjs-dist";

import { PDF_PRINT_SCALE } from "#src/services/constants";
import { getCanvasScale } from "#src/services/getCanvasScale";

// Draws one page to an image for print, at the largest scale its canvas cap fits
export const renderPrintImage = async (
  pdfDocument: PDFDocumentProxy,
  pageNumber: number,
): Promise<HTMLImageElement> => {
  const page = await pdfDocument.getPage(pageNumber);
  const { height, width } = page.getViewport({ scale: 1 });
  // A page past the largest canvas a device draws is printed at the scale that fits it, since a larger one comes out blank
  const printScale = getCanvasScale({
    cssWidth: width,
    pageHeight: height,
    pageWidth: width,
    pixelRatio: PDF_PRINT_SCALE,
  });
  const viewport = page.getViewport({ scale: printScale });
  const canvas = window.document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvas, viewport }).promise;

  const image = window.document.createElement("img");
  image.src = canvas.toDataURL("image/png");
  return image;
};
