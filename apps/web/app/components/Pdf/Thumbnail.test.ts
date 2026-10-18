// @vitest-environment nuxt
import type { PDFDocumentLoadingTask } from "pdfjs-dist";

import PdfThumbnail from "@/components/Pdf/Thumbnail.vue";
import { PDF_MAX_CANVAS_AREA } from "@/services/pdf/constants";
import { loadPdfDocument } from "@/services/pdf/loadPdfDocument";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/services/pdf/loadPdfDocument", () => ({ loadPdfDocument: vi.fn() }));

// The thumbnail draws the first page at the width its row gives it, so the observer's report stands in for a row
// Changing width, and the mocked page answers with the viewport a page of this size has at each scale
describe("pdfThumbnail", () => {
  const PAGE_HEIGHT = 792;
  const PAGE_WIDTH = 612;
  const url = "/files/document.pdf";
  const FIRST_WIDTH = 300;
  const SECOND_WIDTH = 600;
  const LARGE_WIDTH = 4096;
  let reportWidth: ((width: number) => void) | undefined;
  const renders: { cancel: ReturnType<typeof vi.fn>; promise: Promise<void> }[] = [];
  const page = {
    getViewport: ({ scale }: { scale: number }) => ({ height: PAGE_HEIGHT * scale, width: PAGE_WIDTH * scale }),
    render: vi.fn(() => {
      const render = { cancel: vi.fn(), promise: new Promise<void>(() => {}) };
      renders.push(render);
      return render;
    }),
  };
  const createTask = (promise: Promise<unknown>) =>
    ({ destroy: vi.fn(), promise }) as unknown as PDFDocumentLoadingTask;
  const mountThumbnail = (thumbnailUrl: string) =>
    mountSuspended(PdfThumbnail, { attachTo: document.body, props: { url: thumbnailUrl } });

  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: ResizeObserverCallback) {
        reportWidth = (width) => {
          callback([{ contentRect: { width } }] as unknown as ResizeObserverEntry[], this as unknown as ResizeObserver);
        };
      }

      disconnect() {}
      observe() {}
      unobserve() {}
    },
  );

  afterEach(() => {
    document.body.innerHTML = "";
    renders.length = 0;
    page.render.mockClear();
    vi.mocked(loadPdfDocument).mockReset();
    vi.restoreAllMocks();
  });

  const loadPage = () => {
    vi.mocked(loadPdfDocument).mockResolvedValue(
      createTask(Promise.resolve({ getPage: async () => page }) as Promise<unknown>),
    );
  };

  // A row whose width changes draws its page again at the new width, rather than keeping the first one
  test("#20 The row changes width and the page is drawn again", async () => {
    expect.hasAssertions();

    loadPage();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({} as CanvasRenderingContext2D);
    await mountThumbnail(url);
    await flushPromises();
    reportWidth?.(FIRST_WIDTH);
    reportWidth?.(SECOND_WIDTH);

    expect(page.render).toHaveBeenCalledTimes(2);
  });

  // Two renders on one canvas leave it half drawn, so the draw in flight is cancelled by the newer one
  test("#28 cancels the draw in flight when a newer one starts", async () => {
    expect.hasAssertions();

    loadPage();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({} as CanvasRenderingContext2D);
    await mountThumbnail(url);
    await flushPromises();
    reportWidth?.(FIRST_WIDTH);
    reportWidth?.(SECOND_WIDTH);

    expect(renders[0]?.cancel).toHaveBeenCalledOnce();
  });

  // The page is drawn no larger than the largest canvas the device draws, rather than blank
  test("A page larger than the device can draw", async () => {
    expect.hasAssertions();

    loadPage();
    const context = {} as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
    const component = await mountThumbnail(url);
    await flushPromises();
    reportWidth?.(LARGE_WIDTH);
    const canvas = component.find("canvas").element;

    expect(canvas.width * canvas.height).toBeLessThanOrEqual(PDF_MAX_CANVAS_AREA);
  });

  // A missing source has nothing to load, so it draws nothing and throws nothing
  test("#261 a missing source draws nothing", async () => {
    expect.hasAssertions();

    await mountThumbnail("");
    await flushPromises();

    expect(loadPdfDocument).not.toHaveBeenCalled();
  });

  test("The file cannot be fetched", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(loadPdfDocument).mockResolvedValue(createTask(Promise.reject(new Error("Missing"))));
    const component = await mountThumbnail(url);
    await flushPromises();

    expect(component.text()).toContain("could not be loaded");
  });
});
