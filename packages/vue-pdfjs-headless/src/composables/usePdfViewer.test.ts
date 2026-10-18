// @vitest-environment happy-dom
import type { PdfRenderer } from "#src/models/PdfRenderer";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";

import { usePdfViewer } from "#src/composables/usePdfViewer";
import { PDF_MAX_SCALE, PDF_PRINT_CLASS, PDF_ROTATION_STEP } from "#src/services/constants";
import { flushPromises } from "@vue/test-utils";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import { effectScope, nextTick } from "vue";

const PAGE_WIDTH = 800;
const PAGE_HEIGHT = 1000;
const FIND_STATE_NOT_FOUND = 1;
const LINK_TARGET_BLANK = 2;

type Listener = (event: unknown) => void;
type EventBusStub = ReturnType<typeof createEventBus>;
type PdfViewerStub = ReturnType<typeof createPdfViewerStub>;

// The renderer's viewer components stand in for their real ones, which need a canvas and a worker.
// The stubs keep the last viewer they made, so a test can move the viewer or read what the composable asked of it
const stubs: { viewer?: PdfViewerStub } = {};
// How many matches the stub document holds for any search
let matches = 0;

class ResizeObserverStub {
  disconnect() {}
  observe() {}
}

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
  eventBus.on("find", () => {
    const matchesCount = { current: matches > 0 ? 1 : 0, total: matches };
    eventBus.dispatch("updatefindcontrolstate", { matchesCount, state: matches > 0 ? 0 : FIND_STATE_NOT_FOUND });
    eventBus.dispatch("updatefindmatchescount", { matchesCount });
  });

  return { setDocument: vi.fn<() => void>() };
};
const createLinkService = () => ({ setDocument: vi.fn<() => void>(), setViewer: vi.fn<() => void>() });
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
const createDocument = (numPages: number, page = createPage()): PDFDocumentProxy =>
  ({
    getData: vi.fn<PDFDocumentProxy["getData"]>(() => Promise.resolve(new Uint8Array([1, 2, 3]))),
    getPage: vi.fn<PDFDocumentProxy["getPage"]>(() => Promise.resolve(page)),
    numPages,
  }) as unknown as PDFDocumentProxy;
const mountViewer = (pdfDocument: PDFDocumentProxy) => {
  const scope = effectScope();
  const state = scope.run(() =>
    usePdfViewer({
      container: window.document.createElement("div"),
      pdfDocument,
      renderer: createRenderer(),
      viewer: window.document.createElement("div"),
    }),
  );
  assert(state);
  assert(stubs.viewer);

  return { scope, state, viewer: stubs.viewer };
};

describe("usePdfViewer", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    matches = 0;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
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
});
