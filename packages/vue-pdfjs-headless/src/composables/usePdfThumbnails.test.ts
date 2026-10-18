// @vitest-environment happy-dom
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";

import { usePdfThumbnails } from "#src/composables/usePdfThumbnails";
import { flushPromises } from "@vue/test-utils";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";

const PAGE_COUNT = 3;
const SECOND_PAGE = 2;
const ROW_WIDTH = 120;

// The sidebar's rows are reported in and out of view by the observer the composable made
let reportVisibility: (element: Element, isIntersecting: boolean) => void = () => {};
const IntersectionObserverStub = function (callback: (entries: IntersectionObserverEntry[]) => void) {
  reportVisibility = (element, isIntersecting) => {
    callback([{ isIntersecting, target: element } as unknown as IntersectionObserverEntry]);
  };

  return { disconnect: () => {}, observe: () => {}, unobserve: () => {} };
};
// A row reports its width as soon as it is observed, so its page can draw once it is in view
const ResizeObserverStub = function (callback: (entries: ResizeObserverEntry[]) => void) {
  return {
    disconnect: () => {},
    observe: () => {
      callback([{ contentRect: { width: ROW_WIDTH } } as unknown as ResizeObserverEntry]);
    },
  };
};

describe(usePdfThumbnails, () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("the thumbnail sidebar marks the current page", async () => {
    expect.hasAssertions();

    const render = vi.fn<PDFPageProxy["render"]>(
      () => ({ cancel: () => {}, promise: Promise.resolve() }) as unknown as RenderTask,
    );
    const page = {
      getViewport: ({ scale }: { scale: number }) => ({ height: scale, width: scale }),
      render,
    } as unknown as PDFPageProxy;
    const pdfDocument = {
      getPage: vi.fn<PDFDocumentProxy["getPage"]>(() => Promise.resolve(page)),
      numPages: PAGE_COUNT,
    } as unknown as PDFDocumentProxy;
    const currentPageNumber = ref(1);
    const scope = effectScope();
    const thumbnails = scope.run(() => usePdfThumbnails({ currentPageNumber, pdfDocument, root: undefined }));
    assert(thumbnails);
    for (const row of thumbnails.value) row.canvas.value = window.document.createElement("canvas");
    await flushPromises();

    currentPageNumber.value = SECOND_PAGE;
    await nextTick();

    expect(thumbnails.value.map(({ isCurrent }) => isCurrent.value)).toStrictEqual([false, true, false]);
    // Only the second row is in view, so only its page is drawn
    const secondCanvas = thumbnails.value[SECOND_PAGE - 1]?.canvas.value;
    const thirdCanvas = thumbnails.value[PAGE_COUNT - 1]?.canvas.value;
    assert(secondCanvas);
    assert(thirdCanvas);
    reportVisibility(secondCanvas, true);
    reportVisibility(thirdCanvas, false);
    await flushPromises();

    expect(render).toHaveBeenCalledTimes(1);
    scope.stop();
  });
});
