// @vitest-environment happy-dom
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

import { PDF_PRINT_BATCH_SIZE } from "#src/services/constants";
import { renderPrintSheets } from "#src/services/renderPrintSheets";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

const createDocument = (numPages: number, render: () => unknown = () => ({ promise: Promise.resolve() })) => {
  const page = { getViewport: () => ({ height: 1, width: 1 }), render } as unknown as PDFPageProxy;

  return {
    getPage: vi.fn<PDFDocumentProxy["getPage"]>(() => Promise.resolve(page)),
    numPages,
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
    const printRoot = await renderPrintSheets(createDocument(1), () => false);
    assert(printRoot);
    window.document.body.append(printRoot);

    expect(getComputedStyle(printRoot).display).toBe("none");
    printRoot.remove();
  });

  test("a print cancelled mid-draw returns no container", async () => {
    expect.hasAssertions();

    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,");
    let isCancelled = false;
    // The first page's draw cancels the print, which the container's check reads once the page has drawn
    const printRoot = await renderPrintSheets(
      createDocument(2, () => {
        isCancelled = true;

        return { promise: Promise.resolve() };
      }),
      () => isCancelled,
    );

    expect(printRoot).toBeUndefined();
  });

  test("a document longer than one batch renders every page", async () => {
    expect.hasAssertions();

    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,");
    const printRoot = await renderPrintSheets(createDocument(PDF_PRINT_BATCH_SIZE + 1), () => false);

    assert(printRoot);
    expect(printRoot.querySelectorAll("img")).toHaveLength(PDF_PRINT_BATCH_SIZE + 1);
  });
});
