// @vitest-environment happy-dom
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";

import { usePdfPage } from "#src/composables/usePdfPage";
import { PDF_MAX_CANVAS_AREA } from "#src/services/constants";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { effectScope } from "vue";

const PAGE_WIDTH = 800;
const PAGE_HEIGHT = 1000;

type ResizeCallback = (entries: ResizeObserverEntry[]) => void;

// The observer the composable makes for its canvas, kept so a test can report the canvas's width as a screen would
let reportResize: ResizeCallback | undefined;

class ResizeObserverStub {
  constructor(callback: ResizeCallback) {
    reportResize = callback;
  }
  disconnect() {}
  observe() {}
  unobserve() {}
}

const reportWidth = (width: number) => {
  reportResize?.([{ contentRect: { width } }] as ResizeObserverEntry[]);
};
const createRenderTask = (promise: Promise<unknown>) =>
  ({ cancel: vi.fn<RenderTask["cancel"]>(), promise }) as unknown as RenderTask;
const createPage = (render: PDFPageProxy["render"]): PDFPageProxy =>
  ({
    getViewport: ({ scale }: { scale: number }) => ({ height: PAGE_HEIGHT * scale, width: PAGE_WIDTH * scale }),
    render,
  }) as unknown as PDFPageProxy;
const createDocument = (page: PDFPageProxy): PDFDocumentProxy =>
  ({
    getPage: vi.fn<PDFDocumentProxy["getPage"]>(() => Promise.resolve(page)),
    numPages: 1,
  }) as unknown as PDFDocumentProxy;
const mountPage = async (page: PDFPageProxy) => {
  const canvas = window.document.createElement("canvas");
  const scope = effectScope();
  scope.run(() => usePdfPage({ canvas, pageNumber: 1, pdfDocument: createDocument(page) }));
  await flushPromises();

  return { canvas, scope };
};

describe("usePdfPage", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("a page drawn on a high-density screen", async () => {
    expect.hasAssertions();

    vi.stubGlobal("devicePixelRatio", 2);
    const page = createPage(vi.fn<PDFPageProxy["render"]>(() => createRenderTask(new Promise(() => {}))));
    const { canvas, scope } = await mountPage(page);
    reportWidth(400);

    expect(canvas.width).toBe(800);
    scope.stop();
  });

  test("#52 a page too large for the device's canvas", async () => {
    expect.hasAssertions();

    vi.stubGlobal("devicePixelRatio", 1);
    const page = createPage(vi.fn<PDFPageProxy["render"]>(() => createRenderTask(new Promise(() => {}))));
    const { canvas, scope } = await mountPage(page);
    reportWidth(20_000);

    expect(canvas.width).toBeGreaterThan(0);
    expect(canvas.width * canvas.height).toBeLessThanOrEqual(PDF_MAX_CANVAS_AREA);
    scope.stop();
  });

  test("#20 a width change while a page is drawing", async () => {
    expect.hasAssertions();

    vi.stubGlobal("devicePixelRatio", 1);
    const firstTask = createRenderTask(new Promise(() => {}));
    const render = vi
      .fn<PDFPageProxy["render"]>()
      .mockReturnValueOnce(firstTask)
      .mockReturnValueOnce(createRenderTask(new Promise(() => {})));
    const { canvas, scope } = await mountPage(createPage(render));
    reportWidth(400);
    reportWidth(200);

    expect(firstTask.cancel).toHaveBeenCalledExactlyOnceWith();
    expect(render).toHaveBeenCalledTimes(2);
    expect(canvas.width).toBe(200);
    scope.stop();
  });
});
