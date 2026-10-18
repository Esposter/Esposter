import type { PDFDocumentLoadingTask } from "pdfjs-dist";

import { getSynchronizedFunction } from "@esposter/shared";

export const destroyLoadingTask: (task: PDFDocumentLoadingTask) => void = getSynchronizedFunction(
  async (task: PDFDocumentLoadingTask) => {
    await task.destroy();
  },
);
