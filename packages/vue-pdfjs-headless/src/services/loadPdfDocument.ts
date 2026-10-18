import type { PdfDocumentParameters } from "#src/models/PdfDocumentParameters";
import type { PdfRenderer } from "#src/models/PdfRenderer";
import type { PdfSource } from "#src/models/PdfSource";
import type { PDFDocumentLoadingTask } from "pdfjs-dist";

import { getSourceParameters } from "#src/services/getSourceParameters";

// The renderer's data folders and worker are the consumer's, so the worker and the API come from one install.
// The consumer's parameters are passed as given, after the defaults and before the source
export const loadPdfDocument = async (
  renderer: PdfRenderer,
  source: PdfSource,
  parameters: PdfDocumentParameters,
): Promise<PDFDocumentLoadingTask> => {
  renderer.api.GlobalWorkerOptions.workerSrc = renderer.workerSrc;
  const sourceParameters = await getSourceParameters(source);

  return renderer.api.getDocument({
    cMapPacked: true,
    cMapUrl: renderer.cMapUrl,
    standardFontDataUrl: renderer.standardFontDataUrl,
    wasmUrl: renderer.wasmUrl,
    ...parameters,
    ...sourceParameters,
  });
};
