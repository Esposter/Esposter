// @vitest-environment node
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

import { getPdfPages } from "#src/services/getPdfPages";
import { describe, expect, test, vi } from "vitest";

describe(getPdfPages, () => {
  test("every page of a document is loaded, in page order", async () => {
    expect.hasAssertions();

    const pdfDocument = {
      getPage: vi.fn<PDFDocumentProxy["getPage"]>((pageNumber) =>
        Promise.resolve({ pageNumber } as unknown as PDFPageProxy),
      ),
      numPages: 2,
    } as unknown as PDFDocumentProxy;
    const pages = await getPdfPages(pdfDocument);

    expect(pages).toStrictEqual([{ pageNumber: 1 }, { pageNumber: 2 }]);
  });
});
