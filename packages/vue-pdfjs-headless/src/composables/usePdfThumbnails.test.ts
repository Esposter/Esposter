// @vitest-environment happy-dom
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";

import { usePdfThumbnails } from "#src/composables/usePdfThumbnails";
import { noop } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import { effectScope, nextTick, ref, shallowRef } from "vue";

describe(usePdfThumbnails, () => {
  const PAGE_COUNT = 3;
  const SECOND_PAGE = 2;
  const ROW_WIDTH = 120;
  const QUARTER_TURN = 90;

  // The sidebar's rows are reported in and out of view by the observer the composable made, the latest of which is kept
  // With the root it was made against and the rows it watches
  let reportVisibility: (element: Element, isIntersecting: boolean) => void = noop;
  let latestObserver: undefined | { observed: Element[]; root?: Document | Element | null };
  const IntersectionObserverStub = function (
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit,
  ) {
    const observed: Element[] = [];
    latestObserver = { observed, root: options?.root ?? null };
    reportVisibility = (element, isIntersecting) => {
      callback([{ isIntersecting, target: element } as IntersectionObserverEntry]);
    };

    return {
      disconnect: () => {
        observed.length = 0;
      },
      observe: (element: Element) => {
        observed.push(element);
      },
      unobserve: () => {},
    };
  };
  // A row reports its width as soon as it is observed, so its page can draw once it is in view
  const ResizeObserverStub = function (callback: (entries: ResizeObserverEntry[]) => void) {
    return {
      disconnect: () => {},
      observe: () => {
        callback([{ contentRect: { width: ROW_WIDTH } } as ResizeObserverEntry]);
      },
    };
  };

  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Mounts a sidebar of one row per page, each row's canvas attached, and returns the render the rows share
  const mountSidebar = async (pagesRotation = ref(0), root = shallowRef<HTMLElement | undefined>()) => {
    const render = vi.fn<PDFPageProxy["render"]>(
      () => ({ cancel: () => {}, promise: Promise.resolve() }) as RenderTask,
    );
    const getViewport = vi.fn<(parameters: { rotation?: number; scale: number }) => { height: number; width: number }>(
      ({ scale }) => ({ height: scale, width: scale }),
    );
    const page = {
      cleanup: vi.fn<PDFPageProxy["cleanup"]>(() => true),
      getViewport,
      render,
      rotate: 0,
    } as unknown as PDFPageProxy;
    const getPage = vi.fn<PDFDocumentProxy["getPage"]>(() => Promise.resolve(page));
    const pdfDocument = { getPage, numPages: PAGE_COUNT } as unknown as PDFDocumentProxy;
    const currentPageNumber = ref(1);
    const scope = effectScope();
    const thumbnails = scope.run(() => usePdfThumbnails({ currentPageNumber, pagesRotation, pdfDocument, root }));
    assert(thumbnails);
    for (const row of thumbnails.value) row.canvas.value = window.document.createElement("canvas");
    await flushPromises();

    return { currentPageNumber, getPage, getViewport, render, scope, thumbnails };
  };

  test("the thumbnail sidebar marks the current page", async () => {
    expect.hasAssertions();

    const { currentPageNumber, scope, thumbnails } = await mountSidebar();
    currentPageNumber.value = SECOND_PAGE;
    await nextTick();

    expect(thumbnails.value.map(({ isCurrent }) => isCurrent.value)).toStrictEqual([false, true, false]);
    scope.stop();
  });

  test("a thumbnail drawn turns with the pages", async () => {
    expect.hasAssertions();

    const pagesRotation = ref(0);
    const { getViewport, scope, thumbnails } = await mountSidebar(pagesRotation);
    const secondCanvas = thumbnails.value[SECOND_PAGE - 1]?.canvas.value;
    assert(secondCanvas);
    reportVisibility(secondCanvas, true);
    await flushPromises();
    pagesRotation.value = QUARTER_TURN;
    await flushPromises();

    expect(getViewport.mock.lastCall?.[0].rotation).toBe(QUARTER_TURN);
    scope.stop();
  });

  test("only a thumbnail in view of the sidebar is loaded and drawn", async () => {
    expect.hasAssertions();

    const { getPage, render, scope, thumbnails } = await mountSidebar();
    // Only the second row is in view, so only its page is drawn
    const secondCanvas = thumbnails.value[SECOND_PAGE - 1]?.canvas.value;
    const thirdCanvas = thumbnails.value[PAGE_COUNT - 1]?.canvas.value;
    assert(secondCanvas);
    assert(thirdCanvas);
    reportVisibility(secondCanvas, true);
    reportVisibility(thirdCanvas, false);
    await flushPromises();

    expect(getPage).toHaveBeenCalledExactlyOnceWith(SECOND_PAGE);
    expect(render).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  test("the rows are in view of the sidebar once it mounts, not of the viewport", async () => {
    expect.hasAssertions();

    // The sidebar mounts after its document has loaded, so its rows are first watched against the viewport
    const root = shallowRef<HTMLElement | undefined>();
    const { scope, thumbnails } = await mountSidebar(ref(0), root);
    const firstCanvas = thumbnails.value[0]?.canvas.value;
    assert(firstCanvas);
    const sidebar = window.document.createElement("div");
    root.value = sidebar;
    await flushPromises();

    expect(latestObserver?.root).toBe(sidebar);
    expect(latestObserver?.observed).toContain(firstCanvas);
    scope.stop();
  });
});
