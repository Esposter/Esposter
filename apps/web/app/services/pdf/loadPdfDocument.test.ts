import { PDF_CMAP_BASE_URL, PDF_STANDARD_FONT_DATA_BASE_URL, PDF_WASM_BASE_URL } from "@/services/pdf/constants";
import { loadPdfDocument } from "@/services/pdf/loadPdfDocument";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import { describe, expect, test, vi } from "vitest";

// oxlint-disable-next-line vitest/prefer-import-in-mock -- a `?url` asset has no module type to import
vi.mock("pdfjs-dist/build/pdf.worker?url", () => ({ default: "/assets/pdf.worker.mjs" }));
vi.mock(
  import("pdfjs-dist"),
  () =>
    ({ GlobalWorkerOptions: {}, getDocument: vi.fn<typeof getDocument>() }) as unknown as typeof import("pdfjs-dist"),
);

describe("loadPdfDocument", () => {
  const url = "/files/document.pdf";

  test("reads the document with the mounted data folders and the app's own worker", async () => {
    expect.hasAssertions();

    await loadPdfDocument(url);

    expect(GlobalWorkerOptions.workerSrc).toBe("/assets/pdf.worker.mjs");
    expect(getDocument).toHaveBeenCalledWith({
      cMapPacked: true,
      cMapUrl: PDF_CMAP_BASE_URL,
      standardFontDataUrl: PDF_STANDARD_FONT_DATA_BASE_URL,
      url,
      wasmUrl: PDF_WASM_BASE_URL,
    });
  });
});
