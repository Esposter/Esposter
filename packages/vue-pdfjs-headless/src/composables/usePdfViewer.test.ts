// @vitest-environment happy-dom
import type { PdfOutline } from "#src/models/PdfOutline";
import type { PdfViewerApi } from "#src/models/PdfViewerApi";
import type { PageViewport, PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import type { MaybeRefOrGetter } from "vue";

import { PAGE_HEIGHT, PAGE_WIDTH } from "#src/composables/constants.test";
import { createAnnotationStorage } from "#src/composables/createAnnotationStorage.fixture";
import { usePdfViewer } from "#src/composables/usePdfViewer";
import { PdfEditorMode } from "#src/models/PdfEditorMode";
import {
  PDF_FULL_TURN,
  PDF_MAX_SCALE,
  PDF_MIN_SCALE,
  PDF_PRINT_CLASS,
  PDF_ROTATION_STEP,
  PDF_WATERMARK_COLOR,
  PDF_WATERMARK_FONT_SIZE,
} from "#src/services/constants";
import { noop } from "@esposter/shared";
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
// The renderer's viewport converts a point of the page, in PDF coordinates, at the scale it was made for
const createViewport = (scale: number) =>
  ({ convertToViewportPoint: (x: number, y: number) => [x * scale, y * scale] }) as PageViewport;
const createOutlineNode = (dest: string, title: string): PdfOutline[number] => ({
  bold: false,
  color: new Uint8ClampedArray(),
  count: undefined,
  dest,
  italic: false,
  items: [],
  newWindow: undefined,
  title,
  unsafeUrl: undefined,
  url: null,
});

const createPage = (
  render: PDFPageProxy["render"] = vi.fn<PDFPageProxy["render"]>(() => createRenderTask(Promise.resolve())),
): PDFPageProxy =>
  ({
    cleanup: () => true,
    getViewport: ({ scale }: { scale: number }) => ({ height: PAGE_HEIGHT * scale, width: PAGE_WIDTH * scale }),
    render,
    view: [0, 0, PAGE_WIDTH, PAGE_HEIGHT],
  }) as PDFPageProxy;

// A document with no outline resolves to null, which the viewer reads as no bookmarks
const createDocument = (numPages: number, page = createPage(), outline: null | PdfOutline = null): PDFDocumentProxy =>
  ({
    annotationStorage: createAnnotationStorage(),
    getData: vi.fn<PDFDocumentProxy["getData"]>(() => Promise.resolve(new Uint8Array([1, 2, 3]))),
    getOutline: vi.fn<() => Promise<null | PdfOutline>>(() => Promise.resolve(outline)),
    getPage: vi.fn<PDFDocumentProxy["getPage"]>(() => Promise.resolve(page)),
    numPages,
    saveDocument: vi.fn<PDFDocumentProxy["saveDocument"]>(() => Promise.resolve(new Uint8Array([4, 5, 6]))),
  }) as unknown as PDFDocumentProxy;

describe(usePdfViewer, () => {
  const FIND_STATE_NOT_FOUND = 1;
  const LINK_TARGET_BLANK = 2;
  const CHAPTER_PAGE = 3;
  const IMAGE_RESOURCES_PATH = "/pdfjs/images/";

  type EventBusStub = ReturnType<typeof createEventBus>;
  type LinkServiceStub = ReturnType<typeof createLinkService>;
  type Listener = (event: unknown) => void;
  type PdfViewerStub = ReturnType<typeof createPdfViewerStub>;
  interface EditorLayerStub {
    div: { hidden: boolean };
    isEmpty: boolean;
  }
  type EditorManagerStub = ReturnType<typeof createEditorManager>;

  // The scale a preset zoom lands on in the stub, whatever the preset
  const FIT_SCALE = 1.5;
  // The renderer zooms in by a step of 1.1 and stops at 25, which is past the package's own largest scale
  const PDF_RENDERER_MAX_SCALE = 25;
  // The renderer's viewer components stand in for their real ones, which need a canvas and a worker.
  // The stubs keep the last viewer and link service they made, so a test can move the viewer or read what the composable asked of it
  const stubs: {
    abortSignal?: AbortSignal;
    editorModes: number[];
    eventBus?: EventBusStub;
    findEvents: unknown[];
    imageResourcesPath?: string;
    linkService?: LinkServiceStub;
    scaleWrites: unknown[];
    viewer?: PdfViewerStub;
  } = { editorModes: [], findEvents: [], scaleWrites: [] };
  // How many matches the stub document holds for any search
  let matches = 0;
  // The renderer's editor manager for the document it last reported, a double of the layers of its rendered pages
  let editorManager: EditorManagerStub | undefined;

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
    eventBus.on("find", (event: unknown) => {
      stubs.findEvents.push(event);
      // The renderer finds nothing for an empty query, so a cleared search has no matches
      const total = (event as { query: string }).query === "" ? 0 : matches;
      const matchesCount = { current: total > 0 ? 1 : 0, total };
      eventBus.dispatch("updatefindcontrolstate", { matchesCount, state: total > 0 ? 0 : FIND_STATE_NOT_FOUND });
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
    let currentScaleValue: null | string = null;
    let hasEditorManager = false;
    let hasPages = false;
    let pagesRotation = 0;
    // The renderer makes a document's pages once its first page loads, and announces them with pagesinit
    eventBus.on("pagesinit", () => {
      hasPages = true;
    });
    // The renderer makes its editor manager after a document's first page, and announces it, before which it throws on a mode
    eventBus.on("annotationeditoruimanager", () => {
      hasEditorManager = true;
    });
    const viewer = {
      // The renderer's mode is set as an object, and each mode it is set to is kept for a test to read
      get annotationEditorMode() {
        return { mode: stubs.editorModes.at(-1) ?? PdfEditorMode.None };
      },
      set annotationEditorMode({ mode }: { mode: number }) {
        if (!hasEditorManager) throw new Error("The AnnotationEditor is not enabled.");

        stubs.editorModes.push(mode);
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
        viewer.currentScale = Math.min(viewer.currentScale * 1.1, PDF_RENDERER_MAX_SCALE);
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
      // The renderer resets its page and rotation without dispatching an event, and drops its pages until pagesinit. A new
      // Document replaces its editor manager
      setDocument: vi.fn<(loaded: null | PDFDocumentProxy) => void>(() => {
        currentPageNumber = 1;
        currentScaleValue = null;
        hasEditorManager = false;
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
  const PDFLinkService = function () {
    stubs.linkService = createLinkService();

    return stubs.linkService;
  };
  const PDFViewer = function (options: {
    abortSignal?: AbortSignal;
    eventBus: EventBusStub;
    imageResourcesPath?: string;
  }) {
    stubs.abortSignal = options.abortSignal;
    stubs.eventBus = options.eventBus;
    stubs.imageResourcesPath = options.imageResourcesPath;
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
  // The renderer's editor manager has a layer for each page it has rendered, and it restores a stored editor onto
  // The layer as that page renders. The double does so by making the layer hold an editor
  const createEditorManager = (renderedPages: number[]) => {
    const layers = new Map<number, EditorLayerStub>(
      renderedPages.map((pageIndex) => [pageIndex, { div: { hidden: true }, isEmpty: true }]),
    );

    return {
      findClonesForPage: vi.fn<(layer: EditorLayerStub) => Promise<unknown[]>>((layer) => {
        layer.isEmpty = false;

        return Promise.resolve([]);
      }),
      getLayer: (pageIndex: number) => layers.get(pageIndex),
      layers,
    };
  };
  // The stub reports the renderer's editor manager by hand, which the renderer makes after a document's first page.
  // The pages it has rendered by then are the layers the manager holds
  const reportEditorManager = (renderedPages: number[] = []) => {
    editorManager = createEditorManager(renderedPages);
    stubs.eventBus?.dispatch("annotationeditoruimanager", { uiManager: editorManager });

    return editorManager;
  };
  const mountViewer = (pdfDocument: MaybeRefOrGetter<PDFDocumentProxy | undefined>, highlightTerms: string[] = []) => {
    const container = window.document.createElement("div");
    const scope = effectScope();
    const state = scope.run(() =>
      usePdfViewer({
        container,
        highlightTerms,
        imageResourcesPath: IMAGE_RESOURCES_PATH,
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
    stubs.editorModes = [];
    stubs.findEvents = [];
    stubs.scaleWrites = [];
    editorManager = undefined;
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

  test("zooming in past the largest scale stops at the package's maximum", () => {
    expect.hasAssertions();

    const { scope, state, viewer } = mountViewer(createDocument(3));
    // A step from 9.1 would overshoot the package's largest scale, which the zoom must not pass
    viewer.currentScale = 9.1;
    state.zoomIn();

    expect(viewer.currentScale).toBe(PDF_MAX_SCALE);
    scope.stop();
  });

  test("a loaded document opens fitted to its container", () => {
    expect.hasAssertions();

    const { scope, state, viewer } = mountViewer(createDocument(3));
    stubs.eventBus?.dispatch("pagesinit", {});

    expect(viewer.currentScaleValue).toBe("auto");
    expect(state.scale.value).toBe(FIT_SCALE);
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

  test("the zoom reset returns to the scale a document opens in", () => {
    expect.hasAssertions();

    const { scope, state, viewer } = mountViewer(createDocument(3));
    stubs.eventBus?.dispatch("pagesinit", {});
    const openedScale = viewer.currentScaleValue;
    state.fitWidth();
    state.resetZoom();

    expect(viewer.currentScaleValue).toBe(openedScale);
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
    state.rotate(PDF_ROTATION_STEP);

    expect(state.pagesRotation.value).toBe(PDF_ROTATION_STEP);
    scope.stop();
  });

  test("rotating left from upright turns the pages back a step, past the upright", () => {
    expect.hasAssertions();

    const { scope, state } = mountViewer(createDocument(3));
    state.rotate(-PDF_ROTATION_STEP);

    expect(state.pagesRotation.value).toBe(PDF_FULL_TURN - PDF_ROTATION_STEP);
    scope.stop();
  });

  test("rotating past a full turn", () => {
    expect.hasAssertions();

    const { scope, state } = mountViewer(createDocument(3));
    state.rotate(PDF_ROTATION_STEP);
    state.rotate(PDF_ROTATION_STEP);
    state.rotate(PDF_ROTATION_STEP);
    state.rotate(PDF_ROTATION_STEP);

    expect(state.pagesRotation.value).toBe(0);
    scope.stop();
  });

  test("zooming out at the smallest scale", () => {
    expect.hasAssertions();

    const { scope, state, viewer } = mountViewer(createDocument(3));
    viewer.currentScale = PDF_MIN_SCALE;

    expect(state.isZoomOutDisabled.value).toBe(true);
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

  test("a document that replaces another starts with no search", async () => {
    expect.hasAssertions();

    matches = 2;
    const pdfDocument = shallowRef<PDFDocumentProxy | undefined>(createDocument(3));
    const { scope, state } = mountViewer(pdfDocument);
    state.searchQuery.value = "word";
    await flushPromises();
    pdfDocument.value = createDocument(3);
    await flushPromises();

    expect(state.searchQuery.value).toBe("");
    expect(state.matchesCount.value).toStrictEqual({ current: 0, total: 0 });
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

  test("an entry in the annotation storage makes the download save the renderer's bytes", async () => {
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

  test("#37 A watermarked download", async () => {
    expect.hasAssertions();

    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:document");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const pdfDocument = createDocument(3);
    // The watermark is stored only while the renderer saves, so the entries it sees are read at the save
    const storedAtSave: [string, unknown][] = [];
    vi.mocked(pdfDocument.saveDocument).mockImplementation(() => {
      storedAtSave.push(...pdfDocument.annotationStorage);

      return Promise.resolve(new Uint8Array([4, 5, 6]));
    });
    const { scope, state } = mountViewer(pdfDocument);
    state.download("report.pdf", "DRAFT");
    await flushPromises();

    // Each page's watermark is centred on the page's height, PAGE_WIDTH wide and the font size tall
    const watermarkRect = [
      0,
      PAGE_HEIGHT / 2 - PDF_WATERMARK_FONT_SIZE / 2,
      PAGE_WIDTH,
      PAGE_HEIGHT / 2 + PDF_WATERMARK_FONT_SIZE / 2,
    ];

    expect(storedAtSave.map(([, entry]) => entry)).toStrictEqual(
      [0, 1, 2].map((pageIndex) => ({
        annotationType: PdfEditorMode.FreeText,
        color: PDF_WATERMARK_COLOR,
        deleted: false,
        fontSize: PDF_WATERMARK_FONT_SIZE,
        id: `watermark${pageIndex}`,
        pageIndex,
        rect: watermarkRect,
        rotation: 0,
        value: "DRAFT",
      })),
    );
    expect(pdfDocument.annotationStorage.size).toBe(0);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  test("#68 Switching the editor mode", async () => {
    expect.hasAssertions();

    const { scope, state } = mountViewer(createDocument(3));
    reportEditorManager();
    state.editorMode.value = PdfEditorMode.Ink;
    await nextTick();
    state.editorMode.value = PdfEditorMode.None;
    await nextTick();

    // The renderer's new manager starts in none, which the reader's mode is set on as the manager is reported
    expect(stubs.editorModes).toStrictEqual([PdfEditorMode.None, PdfEditorMode.Ink, PdfEditorMode.None]);
    scope.stop();
  });

  test("a mode chosen while the document loads is set once the renderer reports its editor", async () => {
    expect.hasAssertions();

    const { scope, state } = mountViewer(createDocument(3));
    state.editorMode.value = PdfEditorMode.Ink;
    await nextTick();

    // The renderer throws on a mode set before its editor exists, so the mode waits for the report
    expect(stubs.editorModes).toStrictEqual([]);
    reportEditorManager();
    expect(stubs.editorModes).toStrictEqual([PdfEditorMode.Ink]);
    scope.stop();
  });

  test("stored free texts are drawn on each page the renderer has rendered", async () => {
    expect.hasAssertions();

    const { scope, state } = mountViewer(createDocument(3));
    const manager = reportEditorManager([0, 2]);
    state.drawStoredEditors();
    await flushPromises();

    // Page two is not rendered, so its stored free texts are restored when its render draws it
    expect(manager.findClonesForPage.mock.calls).toStrictEqual([[manager.layers.get(0)], [manager.layers.get(2)]]);
    expect(manager.layers.get(0)?.div.hidden).toBe(false);
    expect(manager.layers.get(2)?.div.hidden).toBe(false);
    scope.stop();
  });

  test("drawing stored free texts before the renderer reports its editor manager logs nothing", async () => {
    expect.hasAssertions();

    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
    const { scope, state } = mountViewer(createDocument(3));
    state.drawStoredEditors();
    await flushPromises();

    expect(consoleError).not.toHaveBeenCalled();
    scope.stop();
  });

  test("a stored free text the renderer cannot restore is logged", async () => {
    expect.hasAssertions();

    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
    const { scope, state } = mountViewer(createDocument(3));
    const manager = reportEditorManager([0]);
    const error = new Error("The restore failed");
    manager.findClonesForPage.mockRejectedValueOnce(error);
    state.drawStoredEditors();
    await flushPromises();

    expect(consoleError).toHaveBeenCalledExactlyOnceWith(error);
    scope.stop();
  });

  test("the renderer's annotation icons are read from the image path it is given", () => {
    expect.hasAssertions();

    const { scope } = mountViewer(createDocument(3));

    expect(stubs.imageResourcesPath).toBe(IMAGE_RESOURCES_PATH);
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

  test("#84 #56 placing an overlay on a page", () => {
    expect.hasAssertions();

    const { scope, state, viewer } = mountViewer(createDocument(3));
    const element = window.document.createElement("div");
    const viewport = createViewport(viewer.currentScale);
    stubs.eventBus?.dispatch("pagerendered", { pageNumber: 2, source: { div: element, viewport } });
    stubs.eventBus?.dispatch("pagerendered", { pageNumber: 2, source: { div: element, viewport } });
    const [overlay] = state.overlays.value;
    assert(overlay);

    expect(state.overlays.value).toHaveLength(1);
    expect(overlay.element).toBe(element);
    expect(overlay.pageNumber).toBe(2);
    expect(overlay.viewport).toBe(viewport);
    scope.stop();
  });

  test("#24 highlighting the terms a document opens with", async () => {
    expect.hasAssertions();

    const TERMS = ["word", "page"];
    const { scope, state } = mountViewer(createDocument(3), TERMS);
    await flushPromises();
    const [find] = stubs.findEvents;

    // The terms are the one query the search bar shows, so Next and Previous continue the search the highlight made
    expect(state.searchQuery.value).toBe("word page");
    expect(stubs.findEvents).toHaveLength(1);
    expect(find).toStrictEqual({
      caseSensitive: false,
      entireWord: false,
      findPrevious: false,
      highlightAll: true,
      matchDiacritics: false,
      query: "word page",
      type: "",
    });
    scope.stop();
  });

  test("#44 following a bookmark", async () => {
    expect.hasAssertions();

    const chapter = createOutlineNode("chapter", "Chapter");
    const { scope, state } = mountViewer(createDocument(3, createPage(), [chapter]));
    await flushPromises();
    assert(state.outline.value);
    const [item] = state.outline.value;
    assert(item);
    state.followBookmark(item);

    expect(stubs.linkService?.goToDestination).toHaveBeenCalledExactlyOnceWith("chapter");
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

  test("an outline still being read is undefined, not empty", () => {
    expect.hasAssertions();

    const outline = Promise.withResolvers<null | PdfOutline>();
    const pending = Object.assign(createDocument(3), { getOutline: () => outline.promise });
    const { scope, state } = mountViewer(pending);

    expect(state.outline.value).toBeUndefined();
    scope.stop();
  });

  test("an outline that cannot be read is empty and logged", async () => {
    expect.hasAssertions();

    const error = new Error("a");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const failing = Object.assign(createDocument(3), { getOutline: () => Promise.reject(error) });
    const { scope, state } = mountViewer(failing);
    await flushPromises();

    expect(state.outline.value).toStrictEqual([]);
    expect(consoleError).toHaveBeenCalledExactlyOnceWith(error);
    scope.stop();
  });

  test("an outline that loads after a newer document is dropped", async () => {
    expect.hasAssertions();

    const chapter = createOutlineNode("chapter", "Chapter");
    const staleChapter = createOutlineNode("stale", "Stale");
    const staleOutline = Promise.withResolvers<null | PdfOutline>();
    const staleDocument = Object.assign(createDocument(3), { getOutline: () => staleOutline.promise });
    const pdfDocument = shallowRef<PDFDocumentProxy | undefined>(staleDocument);
    const { scope, state } = mountViewer(pdfDocument);
    pdfDocument.value = createDocument(3, createPage(), [chapter]);
    await flushPromises();
    staleOutline.resolve([staleChapter]);
    await flushPromises();

    expect(state.outline.value).toStrictEqual([chapter]);
    scope.stop();
  });
});
