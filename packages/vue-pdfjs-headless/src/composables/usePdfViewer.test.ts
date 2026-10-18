// @vitest-environment happy-dom
import type { PdfRenderer } from "#src/models/PdfRenderer";
import type { PdfOutline } from "#src/models/PdfOutline";
import type { PDFDocumentProxy, PageViewport, PDFPageProxy, RenderTask } from "pdfjs-dist";

import { usePdfViewer } from "#src/composables/usePdfViewer";
import { PDF_MAX_SCALE, PDF_PRINT_CLASS, PDF_ROTATION_STEP, PDF_WHEEL_ZOOM_DIVISOR } from "#src/services/constants";
import { flushPromises } from "@vue/test-utils";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import { effectScope, nextTick } from "vue";

const PAGE_WIDTH = 800;
const PAGE_HEIGHT = 1000;
const FIND_STATE_NOT_FOUND = 1;
const LINK_TARGET_BLANK = 2;
const CHAPTER_PAGE = 3;

type Listener = (event: unknown) => void;
type EventBusStub = ReturnType<typeof createEventBus>;
type PdfViewerStub = ReturnType<typeof createPdfViewerStub>;

// The renderer's viewer components stand in for their real ones, which need a canvas and a worker.
// The stubs keep the last viewer they made, so a test can move the viewer or read what the composable asked of it
const stubs: { eventBus?: EventBusStub; findEvents: unknown[]; viewer?: PdfViewerStub } = { findEvents: [] };
// How many matches the stub document holds for any search
let matches = 0;

const ResizeObserverStub = function () {
  return { disconnect: () => {}, observe: () => {} };
};

const createEventBus = () => {
  const listeners = new Map<string, Listener[]>();

  return {
    dispatch: (name: string, event: unknown) => {
      for (const listener of listeners.get(name) ?? []) listener(event);
    },
    on: (name: string, listener: Listener) => {
      listeners.set(name, [...(listeners.get(name) ?? []), listener]);
    },
  };
};
const createFindController = ({ eventBus }: { eventBus: EventBusStub }) => {
  eventBus.on("find", (event: unknown) => {
    stubs.findEvents.push(event);
    const matchesCount = { current: matches > 0 ? 1 : 0, total: matches };
    eventBus.dispatch("updatefindcontrolstate", { matchesCount, state: matches > 0 ? 0 : FIND_STATE_NOT_FOUND });
    eventBus.dispatch("updatefindmatchescount", { matchesCount });
  });

  return { setDocument: vi.fn<() => void>() };
};
const createLinkService = () => ({
  // The destination of a bookmark is the chapter's page, which the stub viewer shows
  goToDestination: vi.fn<(destination: unknown) => void>(() => {
    if (stubs.viewer) stubs.viewer.currentPageNumber = CHAPTER_PAGE;
  }),
  setDocument: vi.fn<() => void>(),
  setViewer: vi.fn<() => void>(),
});
const createPdfViewerStub = ({ eventBus }: { eventBus: EventBusStub }) => {
  let currentPageNumber = 0;
  let currentScale = 0;
  let pagesRotation = 0;
  const viewer = {
    cleanup: vi.fn<() => void>(),
    currentScaleValue: "auto",
    decreaseScale: () => {
      viewer.currentScale = Math.max(viewer.currentScale / 1.1, 0.1);
    },
    get currentPageNumber() {
      return currentPageNumber;
    },
    set currentPageNumber(pageNumber: number) {
      currentPageNumber = pageNumber;
      eventBus.dispatch("pagechanging", { pageNumber });
    },
    get currentScale() {
      return currentScale;
    },
    set currentScale(scale: number) {
      currentScale = scale;
      eventBus.dispatch("scalechanging", { scale });
    },
    // The renderer stops zooming at its largest scale, so a step past it leaves the scale where it is
    increaseScale: () => {
      viewer.currentScale = Math.min(viewer.currentScale * 1.1, PDF_MAX_SCALE);
    },
    nextPage: () => {
      viewer.currentPageNumber += 1;
    },
    get pagesRotation() {
      return pagesRotation;
    },
    set pagesRotation(rotation: number) {
      pagesRotation = rotation;
      eventBus.dispatch("rotationchanging", { pagesRotation: rotation });
    },
    previousPage: () => {
      viewer.currentPageNumber -= 1;
    },
    setDocument: vi.fn<() => void>(),
  };

  return viewer;
};
// The renderer's constructors are called with `new`, so each is a plain function that returns the stub it builds
const EventBus = function () {
  return createEventBus();
};
const PDFFindController = function (options: { eventBus: EventBusStub }) {
  return createFindController(options);
};
const PDFLinkService = function () {
  return createLinkService();
};
const PDFViewer = function (options: { eventBus: EventBusStub }) {
  stubs.eventBus = options.eventBus;
  stubs.viewer = createPdfViewerStub(options);

  return stubs.viewer;
};
const createRenderer = (): PdfRenderer => ({
  api: {} as PdfRenderer["api"],
  cMapUrl: "",
  standardFontDataUrl: "",
  viewer: {
    EventBus,
    FindState: { NOT_FOUND: FIND_STATE_NOT_FOUND },
    LinkTarget: { BLANK: LINK_TARGET_BLANK },
    PDFFindController,
    PDFLinkService,
    PDFViewer,
  } as unknown as PdfRenderer["viewer"],
  wasmUrl: "",
  workerSrc: "",
});
const stubPrint = () => {
  const print = vi.fn<() => void>();
  vi.stubGlobal("print", print);

  return print;
};
const createRenderTask = (promise: Promise<unknown>) =>
  ({ cancel: vi.fn<RenderTask["cancel"]>(), promise }) as unknown as RenderTask;
const createPage = (
  render: PDFPageProxy["render"] = vi.fn<PDFPageProxy["render"]>(() => createRenderTask(Promise.resolve())),
): PDFPageProxy =>
  ({
    getViewport: ({ scale }: { scale: number }) => ({ height: PAGE_HEIGHT * scale, width: PAGE_WIDTH * scale }),
    render,
  }) as unknown as PDFPageProxy;
// A document with no outline resolves to null, which the viewer reads as no bookmarks
const createDocument = (numPages: number, page = createPage(), outline: PdfOutline | null = null): PDFDocumentProxy =>
  ({
    getData: vi.fn<PDFDocumentProxy["getData"]>(() => Promise.resolve(new Uint8Array([1, 2, 3]))),
    getOutline: vi.fn<() => Promise<PdfOutline | null>>(() => Promise.resolve(outline)),
    getPage: vi.fn<PDFDocumentProxy["getPage"]>(() => Promise.resolve(page)),
    numPages,
  }) as unknown as PDFDocumentProxy;
// The renderer's viewport converts a point of the page, in PDF coordinates, at the scale it was made for
const createViewport = (scale: number) =>
  ({ convertToViewportPoint: (x: number, y: number) => [x * scale, y * scale] }) as unknown as PageViewport;
const setFullscreenElement = (element: Element | null) => {
  Object.defineProperty(window.document, "fullscreenElement", { configurable: true, value: element });
};
const dispatchPointer = (target: HTMLElement, type: string, pointerId: number, clientX: number, clientY: number) => {
  target.dispatchEvent(Object.assign(new Event(type), { clientX, clientY, pointerId }));
};
const mountViewer = (pdfDocument: PDFDocumentProxy, highlightTerms: string[] = []) => {
  const container = window.document.createElement("div");
  const scope = effectScope();
  const state = scope.run(() =>
    usePdfViewer({
      container,
      highlightTerms,
      pdfDocument,
      renderer: createRenderer(),
      viewer: window.document.createElement("div"),
    }),
  );
  assert(state);
  assert(stubs.viewer);
  assert(stubs.eventBus);

  return { container, scope, state, viewer: stubs.viewer };
};

describe("usePdfViewer", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    matches = 0;
    stubs.findEvents = [];
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Reflect.deleteProperty(window.document, "fullscreenElement");
    for (const element of window.document.querySelectorAll(`.${PDF_PRINT_CLASS}`)) element.remove();
  });

  test("zooming in at the largest scale", () => {
    expect.hasAssertions();

    const { scope, state, viewer } = mountViewer(createDocument(3));
    viewer.currentScale = PDF_MAX_SCALE;
    state.zoomIn();

    expect(state.scale.value).toBe(PDF_MAX_SCALE);
    expect(state.isZoomInDisabled.value).toBe(true);
    scope.stop();
  });

  test("fitting a page to the width", () => {
    expect.hasAssertions();

    const { scope, state, viewer } = mountViewer(createDocument(3));
    state.fitWidth();

    expect(viewer.currentScaleValue).toBe("page-width");
    scope.stop();
  });

  test("going to a page", () => {
    expect.hasAssertions();

    const { scope, state, viewer } = mountViewer(createDocument(3));
    state.goToPage(2);

    expect(viewer.currentPageNumber).toBe(2);
    expect(state.currentPageNumber.value).toBe(2);
    scope.stop();
  });

  test("rotating turns the pages a step", () => {
    expect.hasAssertions();

    const { scope, state } = mountViewer(createDocument(3));
    state.rotate();

    expect(state.pagesRotation.value).toBe(PDF_ROTATION_STEP);
    scope.stop();
  });

  test("#61 searching for a word shows the match count", async () => {
    expect.hasAssertions();

    matches = 3;
    const { scope, state } = mountViewer(createDocument(3));
    state.searchQuery.value = "word";
    await nextTick();

    expect(state.matchesCount.value).toStrictEqual({ current: 1, total: 3 });
    expect(state.isNotFound.value).toBe(false);
    scope.stop();
  });

  test("a word that is not in the document", async () => {
    expect.hasAssertions();

    const { scope, state } = mountViewer(createDocument(3));
    state.searchQuery.value = "word";
    await nextTick();

    expect(state.matchesCount.value).toStrictEqual({ current: 0, total: 0 });
    expect(state.isNotFound.value).toBe(true);
    scope.stop();
  });

  test("downloading a document under its name", async () => {
    expect.hasAssertions();

    const createObjectURL = vi.fn<(blob: Blob) => string>(() => "blob:document");
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn<(url: string) => void>() });
    let downloadName = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloadName = this.download;
    });
    const { scope, state } = mountViewer(createDocument(3));
    state.download("report.pdf");
    await flushPromises();
    const [blob] = createObjectURL.mock.calls[0] ?? [];
    assert(blob);

    expect(downloadName).toBe("report.pdf");
    expect(new Uint8Array(await blob.arrayBuffer())).toStrictEqual(new Uint8Array([1, 2, 3]));
    scope.stop();
  });

  test("printing a document", async () => {
    expect.hasAssertions();

    const printSpy = stubPrint();
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,");
    const { scope, state } = mountViewer(createDocument(3));
    state.print();
    await flushPromises();

    expect(window.document.querySelectorAll(`.${PDF_PRINT_CLASS} img`)).toHaveLength(3);
    expect(printSpy).toHaveBeenCalledExactlyOnceWith();
    window.dispatchEvent(new Event("afterprint"));

    expect(window.document.querySelector(`.${PDF_PRINT_CLASS}`)).toBeNull();
    scope.stop();
  });

  test("unmounting while a print is drawing", async () => {
    expect.hasAssertions();

    const printSpy = stubPrint();
    const page = createPage(vi.fn<PDFPageProxy["render"]>(() => createRenderTask(new Promise(() => {}))));
    const { scope, state } = mountViewer(createDocument(1, page));
    state.print();
    await flushPromises();
    scope.stop();
    await flushPromises();

    expect(printSpy).not.toHaveBeenCalled();
    expect(window.document.querySelector(`.${PDF_PRINT_CLASS}`)).toBeNull();
  });

  test("#84 #56 placing an overlay on a page", () => {
    expect.hasAssertions();

    const { scope, state, viewer } = mountViewer(createDocument(3));
    const element = window.document.createElement("div");
    const viewport = createViewport(viewer.currentScale);
    stubs.eventBus?.dispatch("pagerendered", { pageNumber: 2, source: { div: element, viewport } });
    const [overlay] = state.overlays.value;
    assert(overlay);

    expect(state.overlays.value).toHaveLength(1);
    expect(overlay.element).toBe(element);
    expect(overlay.pageNumber).toBe(2);
    expect(overlay.viewport).toBe(viewport);
    scope.stop();
  });

  test("#26 highlighting an area of a page", () => {
    expect.hasAssertions();

    const { scope, state, viewer } = mountViewer(createDocument(3));
    viewer.currentScale = 2;
    stubs.eventBus?.dispatch("pagerendered", {
      pageNumber: 1,
      source: { div: window.document.createElement("div"), viewport: createViewport(viewer.currentScale) },
    });
    const [overlay] = state.overlays.value;
    assert(overlay);
    // The rectangle's corners, in PDF coordinates, land at the same area of the page on screen at the doubled scale
    const [left, top] = overlay.viewport.convertToViewportPoint(10, 20);
    const [right, bottom] = overlay.viewport.convertToViewportPoint(110, 220);

    expect([left, top, right, bottom]).toStrictEqual([20, 40, 220, 440]);
    scope.stop();
  });

  test("#24 highlighting a list of terms on load", () => {
    expect.hasAssertions();

    const TERMS = ["word", "page"];
    const { scope } = mountViewer(createDocument(3), TERMS);
    const [find] = stubs.findEvents;

    expect(stubs.findEvents).toHaveLength(1);
    expect(find).toStrictEqual({
      caseSensitive: false,
      entireWord: false,
      findPrevious: false,
      highlightAll: true,
      matchDiacritics: false,
      query: TERMS,
      type: "",
    });
    scope.stop();
  });

  test("#44 following a bookmark", async () => {
    expect.hasAssertions();

    const chapter = { dest: "chapter", items: [], title: "Chapter" } as unknown as PdfOutline[number];
    const { scope, state, viewer } = mountViewer(createDocument(3, createPage(), [chapter]));
    await flushPromises();
    const [item] = state.outline.value;
    assert(item);
    state.followBookmark(item);

    expect(viewer.currentPageNumber).toBe(CHAPTER_PAGE);
    expect(state.currentPageNumber.value).toBe(CHAPTER_PAGE);
    scope.stop();
  });

  test("a document with no outline", async () => {
    expect.hasAssertions();

    const { scope, state } = mountViewer(createDocument(3));
    await flushPromises();

    expect(state.outline.value).toStrictEqual([]);
    scope.stop();
  });

  test("leaving fullscreen with the Escape key", async () => {
    expect.hasAssertions();

    const { container, scope, state } = mountViewer(createDocument(3));
    Object.assign(container, {
      requestFullscreen: vi.fn<() => Promise<void>>(() => {
        setFullscreenElement(container);
        window.document.dispatchEvent(new Event("fullscreenchange"));

        return Promise.resolve();
      }),
    });
    state.toggleFullscreen();
    await flushPromises();

    expect(state.isFullscreen.value).toBe(true);
    // The browser leaves fullscreen when Escape is pressed, and reports the change to the page
    setFullscreenElement(null);
    window.document.dispatchEvent(new Event("fullscreenchange"));

    expect(state.isFullscreen.value).toBe(false);
    scope.stop();
  });

  test("#223 pinching to zoom", () => {
    expect.hasAssertions();

    const { container, scope, state, viewer } = mountViewer(createDocument(3));
    viewer.currentScale = 1;
    dispatchPointer(container, "pointerdown", 1, 100, 100);
    dispatchPointer(container, "pointerdown", 2, 200, 100);
    dispatchPointer(container, "pointermove", 2, 300, 100);

    expect(state.scale.value).toBe(2);
    // The point between the pointers is 200 across, so the content under it stays there at the doubled scale
    expect(container.scrollLeft).toBe(200);
    scope.stop();
  });

  test("zooming with Ctrl and the wheel", () => {
    expect.hasAssertions();

    const { container, scope, state, viewer } = mountViewer(createDocument(3));
    viewer.currentScale = 1;
    container.dispatchEvent(
      Object.assign(new Event("wheel", { cancelable: true }), {
        clientX: 0,
        clientY: 0,
        ctrlKey: true,
        deltaY: -PDF_WHEEL_ZOOM_DIVISOR,
      }),
    );

    expect(state.scale.value).toBeCloseTo(Math.E);
    scope.stop();
  });
});
