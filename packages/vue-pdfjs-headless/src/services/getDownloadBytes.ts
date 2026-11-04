import type { PDFDocumentProxy } from "pdfjs-dist";

// The original bytes while the annotation storage is empty, otherwise the renderer's saved bytes, which carry the stored values and editors
export const getDownloadBytes = async (pdfDocument: PDFDocumentProxy): Promise<Uint8Array<ArrayBuffer>> => {
  if (pdfDocument.annotationStorage.size === 0)
    // The bytes may sit on a shared buffer, which a Blob does not take, so the download is a copy
    return new Uint8Array(await pdfDocument.getData());

  return pdfDocument.saveDocument();
};
