// @vitest-environment happy-dom
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

import { renderPrintSheets } from "#src/services/renderPrintSheets";
import { assert, afterEach, describe, expect, test, vi } from "vitest";

const createDocument = (): PDFDocumentProxy => {
  const page = {
    getViewport: () => ({ height: 1, width: 1 }),
    render: () => ({ promise: Promise.resolve() }),
  } as unknown as PDFPageProxy;

  return {
    getPage: vi.fn<PDFDocumentProxy["getPage"]>(() => Promise.resolve(page)),
    numPages: 1,
  } as unknown as PDFDocumentProxy;
};

describe(renderPrintSheets, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The print container is for print alone, so on screen it takes no space and shows nothing of the pages
  test("the print container is hidden on screen", async () => {
    expect.hasAssertions();

    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,");
    const printRoot = await renderPrintSheets(createDocument(), () => false);
    assert(printRoot);
    window.document.body.append(printRoot);

    expect(getComputedStyle(printRoot).display).toBe("none");
    printRoot.remove();
  });
});
