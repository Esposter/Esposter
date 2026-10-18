import type { PdfApi } from "#src/models/PdfApi";
import type { PdfRenderer } from "#src/models/PdfRenderer";

import { loadPdfDocument } from "#src/services/loadPdfDocument";
import { describe, expect, test, vi } from "vitest";

describe(loadPdfDocument, () => {
  const url = "/document.pdf";
  const WORKER_SOURCE = "/worker.mjs";
  const C_MAP_URL = "/character-maps/";
  const STANDARD_FONT_DATA_URL = "/standard-fonts/";
  const WASM_URL = "/wasm/";

  test("loading through the renderer's module with its data folders", async () => {
    expect.hasAssertions();

    const getDocument = vi.fn<PdfApi["getDocument"]>();
    const globalWorkerOptions = { workerSrc: "" };
    const renderer = {
      api: { GlobalWorkerOptions: globalWorkerOptions, getDocument } as unknown as PdfApi,
      cMapUrl: C_MAP_URL,
      standardFontDataUrl: STANDARD_FONT_DATA_URL,
      wasmUrl: WASM_URL,
      workerSrc: WORKER_SOURCE,
    } satisfies PdfRenderer;
    await loadPdfDocument(renderer, url, {});

    expect(globalWorkerOptions.workerSrc).toBe(WORKER_SOURCE);
    expect(getDocument).toHaveBeenCalledExactlyOnceWith({
      cMapPacked: true,
      cMapUrl: C_MAP_URL,
      standardFontDataUrl: STANDARD_FONT_DATA_URL,
      url,
      wasmUrl: WASM_URL,
    });
  });
});
