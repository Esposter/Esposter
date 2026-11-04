import type { PDFDocumentProxy } from "pdfjs-dist";

import { PDF_EDITOR_KEY_PREFIX, PDF_WATERMARK_COLOR, PDF_WATERMARK_FONT_SIZE } from "#src/services/constants";
import { createFreeTextEntry } from "#src/services/createFreeTextEntry";
import { getPdfPages } from "#src/services/getPdfPages";
import { withFinalizerAsync } from "@esposter/shared";

// Stores the watermark on every page as a free-text annotation, and returns the keys it stored them under
const addWatermark = async (pdfDocument: PDFDocumentProxy, watermark: string): Promise<string[]> => {
  const { annotationStorage } = pdfDocument;
  const pages = await getPdfPages(pdfDocument);

  return pages.map((page, pageIndex) => {
    // A free text's rectangle is in the page's unturned user space, so the band is laid across that box's middle
    const [left = 0, bottom = 0, right = 0, top = 0] = page.view;
    // The box is all the page is read for here, so its proxy is released once the box is read
    page.cleanup();
    const middle = (bottom + top) / 2;
    const id = `watermark${pageIndex}`;
    const key = `${PDF_EDITOR_KEY_PREFIX}${id}`;
    annotationStorage.setValue(
      key,
      createFreeTextEntry({
        color: PDF_WATERMARK_COLOR,
        fontSize: PDF_WATERMARK_FONT_SIZE,
        id,
        pageIndex,
        rect: [left, middle - PDF_WATERMARK_FONT_SIZE / 2, right, middle + PDF_WATERMARK_FONT_SIZE / 2],
        value: watermark,
      }),
    );

    return key;
  });
};

// The original bytes while nothing has changed and no watermark is set, otherwise the renderer's saved bytes. A watermark
// Is stored only for that save and removed after it, so the pages on screen never carry it
export const getDownloadBytes = async (
  pdfDocument: PDFDocumentProxy,
  watermark: string | undefined,
): Promise<Uint8Array<ArrayBuffer>> => {
  const { annotationStorage } = pdfDocument;
  if (annotationStorage.size === 0 && !watermark)
    // The bytes may sit on a shared buffer, which a Blob does not take, so the download is a copy
    return new Uint8Array(await pdfDocument.getData());

  const watermarkKeys = watermark ? await addWatermark(pdfDocument, watermark) : [];

  return withFinalizerAsync(
    () => pdfDocument.saveDocument(),
    () => {
      for (const key of watermarkKeys) annotationStorage.remove(key);
    },
  );
};
