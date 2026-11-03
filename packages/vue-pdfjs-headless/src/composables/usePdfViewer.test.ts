// @vitest-environment happy-dom
import type { PdfViewerApi } from "#src/models/PdfViewerApi";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import type { MaybeRefOrGetter } from "vue";

import { PAGE_HEIGHT, PAGE_WIDTH } from "#src/composables/constants.test";
import { createAnnotationStorage } from "#src/composables/createAnnotationStorage.fixture";
import { usePdfViewer } from "#src/composables/usePdfViewer";
import { PDF_MAX_SCALE, PDF_PRINT_CLASS, PDF_ROTATION_STEP } from "#src/services/constants";
import { flushPromises } from "@vue/test-utils";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import { effectScope, nextTick, shallowRef } from "vue";

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
  }) as PDFPageProxy;

const createDocument = (numPages: number, page = createPage()): PDFDocumentProxy =>
  ({
    annotationStorage: createAnnotationStorage(),
    getData: vi.fn<PDFDocumentProxy["getData"]>(() => Promise.resolve(new Uint8Array([1, 2, 3]))),
    getPage: vi.fn<PDFDocumentProxy["getPage"]>(() => Promise.resolve(page)),
    numPages,
    saveDocument: vi.fn<PDFDocumentProxy["saveDocument"]>(() => Promise.resolve(new Uint8Array([4, 5, 6]))),
  }) as unknown as PDFDocumentProxy;

const createLinkService = () => ({ setDocument: vi.fn<() => void>(), setViewer: vi.fn<() => void>() });
const PDFLinkService = function () {
  return createLinkService();
};

describe(usePdfViewer, () => {
  const FIND_STATE_NOT_FOUND = 1;
  const LINK_TARGET_BLANK = 2;

  type EventBusStub = ReturnType<typeof createEventBus>;
  type Listener = (event: unknown) => void;
  type PdfViewerStub = ReturnType<typeof createPdfViewerStub>;

  // The scale a preset zoom lands on in the stub, whatever the preset
  const FIT_SCALE = 1.5;
  // The renderer's viewer components stand in for their real ones, which need a canvas and a worker.
  // The stubs keep the last viewer they made, so a test can move the viewer or read what the composable asked of it
  const stubs: { abortSignal?: AbortSignal; eventBus?: EventBusStub; scaleWrites: unknown[]; viewer?: PdfViewerStub } =
    { scaleWrites: [] };
  // How many matches the stub document holds for any search
  let matches = 0;

  // The observer the composable makes for its container, kept so a test can report a resize as a browser would
  let reportResize: (() => void) | undefined;

  const ResizeObserverStub = function (callback: () => void) {
    reportResize = callback;

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
    eventBus.on("find", () => {
      const matchesCount = { current: matches > 0 ? 1 : 0, total: matches };
      eventBus.dispatch("updatefindcontrolstate", { matchesCount, state: matches > 0 ? 0 : FIND_STATE_NOT_FOUND });
      eventBus.dispatch("updatefindmatchescount", { matchesCount });
    });

    return { setDocument: vi.fn<() => void>() };
  };
  const createPdfViewerStub = ({ eventBus }: { eventBus: EventBusStub }) => {
    let currentPageNumber = 0;
    let currentScale = 0;
    let currentScaleValue: null | string = null;
    let hasPages = false;
    let pagesRotation = 0;
    // The renderer makes a document's pages once its first page loads, and announces them with pagesinit
    eventBus.on("pagesinit", () => {
      hasPages = true;
    });
    const viewer = {
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
      get currentScaleValue() {
        return currentScaleValue;
      },
      set currentScaleValue(scaleValue: null | string) {
        stubs.scaleWrites.push(scaleValue);
        // The renderer applies a preset zoom only to pages it has, so a preset written before pagesinit is dropped
        if (!hasPages || scaleValue === null) return;

        currentScaleValue = scaleValue;
        viewer.currentScale = FIT_SCALE;
      },
      decreaseScale: () => {
        viewer.currentScale = Math.max(viewer.currentScale / 1.1, 0.1);
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
      },
      previousPage: () => {
        viewer.currentPageNumber -= 1;
      },
      // The renderer resets its page and rotation without dispatching an event, and drops its pages until pagesinit
      setDocument: vi.fn<(loaded: null | PDFDocumentProxy) => void>(() => {
        currentPageNumber = 1;
        currentScaleValue = null;
        hasPages = false;
        pagesRotation = 0;
      }),
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
  const PDFViewer = function (options: { abortSignal?: AbortSignal; eventBus: EventBusStub }) {
    stubs.abortSignal = options.abortSignal;
    stubs.eventBus = options.eventBus;
    stubs.viewer = createPdfViewerStub(options);

    return stubs.viewer;
  };
  const createViewerApi = (): PdfViewerApi =>
    ({
      EventBus,
      FindState: { NOT_FOUND: FIND_STATE_NOT_FOUND },
      LinkTarget: { BLANK: LINK_TARGET_BLANK },
      PDFFindController,
      PDFLinkService,
      PDFViewer,
    }) as unknown as PdfViewerApi;
  const mountViewer = (pdfDocument: MaybeRefOrGetter<PDFDocumentProxy | undefined>) => {
    const container = window.document.createElement("div");
    const scope = effectScope();
    const state = scope.run(() =>
      usePdfViewer({
        container,
        pdfDocument,
        viewer: window.document.createElement("div"),
        viewerApi: createViewerApi(),
      }),
    );
    assert(state);
    assert(stubs.viewer);
    assert(stubs.eventBus);

    return { container, scope, state, viewer: stubs.viewer };
  };

  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    matches = 0;
    stubs.scaleWrites = [];
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

    expect(state.isZoomInDisabled.value).toBe(true);
    scope.stop();
  });

  test("a loaded document opens fitted to its container", () => {
    expect.hasAssertions();

    const { scope, viewer } = mountViewer(createDocument(3));
    stubs.eventBus?.dispatch("pagesinit", {});

    expect(viewer.currentScaleValue).toBe("auto");
    expect(viewer.currentScale).toBe(FIT_SCALE);
    scope.stop();
  });

  test("a resize keeps a fit", () => {
    expect.hasAssertions();

    const { scope, state } = mountViewer(createDocument(3));
    stubs.eventBus?.dispatch("pagesinit", {});
    state.fitWidth();
    stubs.scaleWrites = [];
    reportResize?.();

    expect(stubs.scaleWrites).toStrictEqual(["page-width"]);
    scope.stop();
  });

  test.each([
    ["fitWidth", "page-width"],
    ["fitPage", "page-fit"],
    ["actualSize", "page-actual"],
  ] as const)("%s zooms the pages to %s", (action, scaleValue) => {
    expect.hasAssertions();

    const { scope, state, viewer } = mountViewer(createDocument(3));
    stubs.eventBus?.dispatch("pagesinit", {});
    state[action]();

    expect(viewer.currentScaleValue).toBe(scaleValue);
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

    const { scope, state, viewer } = mountViewer(createDocument(3));
    state.rotate();

    expect(viewer.pagesRotation).toBe(PDF_ROTATION_STEP);
    scope.stop();
  });

  test.each([
    [3, 1, false],
    [0, 0, true],
  ])("#61 searching for a word with %i matches shows the match count", async (total, current, isNotFound) => {
    expect.hasAssertions();

    matches = total;
    const { scope, state } = mountViewer(createDocument(3));
    state.searchQuery.value = "word";
    await nextTick();

    expect(state.matchesCount.value).toStrictEqual({ current, total });
    expect(state.isNotFound.value).toBe(isNotFound);
    scope.stop();
  });

  test("a resize before any document writes no scale", () => {
    expect.hasAssertions();

    const { scope } = mountViewer(undefined);
    reportResize?.();

    expect(stubs.scaleWrites).toStrictEqual([]);
    scope.stop();
  });

  test("a second document starts on its first page", async () => {
    expect.hasAssertions();

    const pdfDocument = shallowRef<PDFDocumentProxy | undefined>(createDocument(3));
    const { scope, state, viewer } = mountViewer(pdfDocument);
    viewer.currentPageNumber = 7;
    pdfDocument.value = createDocument(3);
    await nextTick();

    expect(state.currentPageNumber.value).toBe(1);
    scope.stop();
  });

  test("downloading a document under its name", async () => {
    expect.hasAssertions();

    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:document");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    let downloadName = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloadName = this.download;
    });
    const { scope, state } = mountViewer(createDocument(3));
    state.download("report.pdf");
    await flushPromises();
    const [blob] = createObjectURL.mock.calls[0] ?? [];
    assert(blob instanceof Blob);

    expect(downloadName).toBe("report.pdf");
    expect(new Uint8Array(await blob.arrayBuffer())).toStrictEqual(new Uint8Array([1, 2, 3]));
    scope.stop();
  });

  test("an unedited document downloads its original bytes", async () => {
    expect.hasAssertions();

    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:document");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const pdfDocument = createDocument(3);
    const { scope, state } = mountViewer(pdfDocument);
    state.download("report.pdf");
    await flushPromises();
    const [blob] = createObjectURL.mock.calls[0] ?? [];
    assert(blob instanceof Blob);

    expect(pdfDocument.saveDocument).not.toHaveBeenCalled();
    expect(new Uint8Array(await blob.arrayBuffer())).toStrictEqual(new Uint8Array([1, 2, 3]));
    scope.stop();
  });

  test("#268 Filling a form and downloading it", async () => {
    expect.hasAssertions();

    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:document");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const pdfDocument = createDocument(3);
    const { scope, state } = mountViewer(pdfDocument);
    // The renderer keys a field's value by the field's id, which its input writes under that id
    pdfDocument.annotationStorage.setValue("4R", { value: "Typed" });
    state.download("report.pdf");
    await flushPromises();
    const [blob] = createObjectURL.mock.calls[0] ?? [];
    assert(blob instanceof Blob);

    expect(pdfDocument.saveDocument).toHaveBeenCalledTimes(1);
    expect(new Uint8Array(await blob.arrayBuffer())).toStrictEqual(new Uint8Array([4, 5, 6]));
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
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,");
    const rendered = Promise.withResolvers<void>();
    const page = createPage(vi.fn<PDFPageProxy["render"]>(() => createRenderTask(rendered.promise)));
    const { scope, state } = mountViewer(createDocument(1, page));
    state.print();
    await flushPromises();
    scope.stop();
    rendered.resolve();
    await flushPromises();

    expect(printSpy).not.toHaveBeenCalled();
    expect(window.document.querySelector(`.${PDF_PRINT_CLASS}`)).toBeNull();
  });

  test("disposing the scope clears the document and aborts the viewer's listeners", () => {
    expect.hasAssertions();

    const { scope, viewer } = mountViewer(createDocument(3));
    scope.stop();

    assert(stubs.abortSignal);
    expect(stubs.abortSignal.aborted).toBe(true);
    expect(viewer.setDocument).toHaveBeenLastCalledWith(null);
  });
});
