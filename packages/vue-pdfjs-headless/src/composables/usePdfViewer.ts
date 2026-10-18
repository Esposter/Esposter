import type { PdfMatchesCount } from "#src/models/PdfMatchesCount";
import type { PdfOutline } from "#src/models/PdfOutline";
import type { PdfPageOverlay } from "#src/models/PdfPageOverlay";
import type { PdfRenderer } from "#src/models/PdfRenderer";
import type { PdfViewerState } from "#src/models/PdfViewerState";
import type { PDFDocumentProxy, PageViewport } from "pdfjs-dist";
import type {
  EventBus as PdfJsEventBus,
  PDFFindController as PdfJsFindController,
  PDFLinkService as PdfJsLinkService,
  PDFViewer as PdfJsViewer,
} from "pdfjs-dist/web/pdf_viewer.mjs";
import type { MaybeRefOrGetter } from "vue";

import {
  PDF_FULL_TURN,
  PDF_MAX_CANVAS_AREA,
  PDF_MAX_SCALE,
  PDF_MIN_SCALE,
  PDF_ROTATION_STEP,
  PDF_WHEEL_ZOOM_DIVISOR,
} from "#src/services/constants";
import { getZoomedScroll } from "#src/services/getZoomedScroll";
import { renderPrintSheets } from "#src/services/renderPrintSheets";
import { saveDocument } from "#src/services/saveDocument";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";
import { computed, onScopeDispose, ref, shallowRef, toValue, watch } from "vue";

interface UsePdfViewerOptions {
  container: MaybeRefOrGetter<HTMLDivElement | undefined>;
  // The terms highlighted on load, every match of each one
  highlightTerms?: MaybeRefOrGetter<string[]>;
  pdfDocument: MaybeRefOrGetter<PDFDocumentProxy | undefined>;
  renderer: MaybeRefOrGetter<PdfRenderer | undefined>;
  viewer: MaybeRefOrGetter<HTMLDivElement | undefined>;
}

interface PinchPoint {
  x: number;
  y: number;
}

// Builds the renderer's viewer for a loaded document on the consumer's container.
// Its pages, zoom, rotation, search, download and print are state and actions, and it draws no chrome
export const usePdfViewer = ({
  container,
  highlightTerms = [],
  pdfDocument,
  renderer,
  viewer,
}: UsePdfViewerOptions): PdfViewerState => {
  const currentPageNumber = ref(0);
  const isFullscreen = ref(false);
  const isMatchCase = ref(false);
  const isNotFound = ref(false);
  const isWholeWord = ref(false);
  const matchesCount = ref<PdfMatchesCount>({ current: 0, total: 0 });
  const outline = shallowRef<PdfOutline>([]);
  const overlays = shallowRef<PdfPageOverlay[]>([]);
  const pagesCount = ref(0);
  const pagesRotation = ref(0);
  const scale = ref(0);
  const searchQuery = ref("");
  const isZoomInDisabled = computed(() => scale.value >= PDF_MAX_SCALE);
  const pointers = new Map<number, PinchPoint>();
  let containerElement: HTMLDivElement | undefined;
  let eventBus: PdfJsEventBus | undefined;
  let findController: PdfJsFindController | undefined;
  let linkService: PdfJsLinkService | undefined;
  let pdfViewer: PdfJsViewer | undefined;
  let pinchDistance = 0;
  let resizeObserver: ResizeObserver | undefined;
  let printRoot: HTMLDivElement | undefined;
  // Bumped by every print and by the scope's end, so a print still drawing stops before it reaches the page
  let printGeneration = 0;

  const measurePinch = () => {
    const [first, second] = [...pointers.values()];
    if (pointers.size !== 2 || !first || !second) return undefined;

    return {
      distance: Math.hypot(second.x - first.x, second.y - first.y),
      point: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
    };
  };
  // Scales the viewer about a point of the screen, keeping the content under that point where it was
  const zoomAbout = (ratio: number, point: PinchPoint) => {
    if (!pdfViewer || !containerElement || !pdfViewer.currentScale) return;

    const { currentScale } = pdfViewer;
    const nextScale = Math.min(Math.max(currentScale * ratio, PDF_MIN_SCALE), PDF_MAX_SCALE);
    const scaleRatio = nextScale / currentScale;
    const { left, top } = containerElement.getBoundingClientRect();
    const { scrollLeft, scrollTop } = containerElement;
    pdfViewer.currentScale = nextScale;
    containerElement.scrollLeft = getZoomedScroll({ point: point.x - left, ratio: scaleRatio, scroll: scrollLeft });
    containerElement.scrollTop = getZoomedScroll({ point: point.y - top, ratio: scaleRatio, scroll: scrollTop });
  };
  const onPointerDown = (event: PointerEvent) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    pinchDistance = measurePinch()?.distance ?? 0;
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return;

    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pinch = measurePinch();
    if (pinch && pinchDistance > 0) zoomAbout(pinch.distance / pinchDistance, pinch.point);
    pinchDistance = pinch?.distance ?? 0;
  };
  const onPointerEnd = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    pinchDistance = measurePinch()?.distance ?? 0;
  };
  const onWheel = (event: WheelEvent) => {
    if (!event.ctrlKey) return;

    event.preventDefault();
    zoomAbout(Math.exp(-event.deltaY / PDF_WHEEL_ZOOM_DIVISOR), { x: event.clientX, y: event.clientY });
  };
  const onFullscreenChange = () => {
    isFullscreen.value = window.document.fullscreenElement === containerElement;
  };
  const createViewer = (
    currentRenderer: PdfRenderer,
    containerValue: HTMLDivElement,
    viewerElement: HTMLDivElement,
  ) => {
    const { EventBus, FindState, LinkTarget, PDFFindController, PDFLinkService, PDFViewer } = currentRenderer.viewer;
    const bus = new EventBus();
    const links = new PDFLinkService({ eventBus: bus, externalLinkTarget: LinkTarget.BLANK });
    const controller = new PDFFindController({ eventBus: bus, linkService: links });
    const instance = new PDFViewer({
      container: containerValue,
      eventBus: bus,
      findController: controller,
      linkService: links,
      maxCanvasPixels: PDF_MAX_CANVAS_AREA,
      viewer: viewerElement,
    });
    links.setViewer(instance);
    containerElement = containerValue;
    eventBus = bus;
    findController = controller;
    linkService = links;
    pdfViewer = instance;
    bus.on("pagechanging", (event: { pageNumber: number }) => {
      currentPageNumber.value = event.pageNumber;
    });
    bus.on("pagerendered", (event: { pageNumber: number; source: { div: HTMLElement; viewport: PageViewport } }) => {
      const overlay: PdfPageOverlay = {
        element: event.source.div,
        pageNumber: event.pageNumber,
        viewport: event.source.viewport,
      };
      overlays.value = [...overlays.value.filter(({ pageNumber }) => pageNumber !== event.pageNumber), overlay];
    });
    bus.on("scalechanging", (event: { scale: number }) => {
      scale.value = event.scale;
    });
    bus.on("rotationchanging", (event: { pagesRotation: number }) => {
      pagesRotation.value = event.pagesRotation;
    });
    bus.on("updatefindcontrolstate", (event: { matchesCount: PdfMatchesCount; state: number }) => {
      isNotFound.value = event.state === FindState.NOT_FOUND;
      matchesCount.value = event.matchesCount;
    });
    bus.on("updatefindmatchescount", (event: { matchesCount: PdfMatchesCount }) => {
      matchesCount.value = event.matchesCount;
    });
    resizeObserver = new ResizeObserver(() => {
      // A fit stays a fit when the container changes width, which pdf.js does not do on its own
      if (!pdfViewer) return;

      const { currentScaleValue } = pdfViewer;
      pdfViewer.currentScaleValue = currentScaleValue;
    });
    resizeObserver.observe(containerValue);
    containerValue.addEventListener("pointerdown", onPointerDown);
    containerValue.addEventListener("pointermove", onPointerMove);
    containerValue.addEventListener("pointerup", onPointerEnd);
    containerValue.addEventListener("pointercancel", onPointerEnd);
    containerValue.addEventListener("pointerleave", onPointerEnd);
    containerValue.addEventListener("wheel", onWheel, { passive: false });
    window.document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("afterprint", removePrint);
    applyDocument(toValue(pdfDocument));
  };
  const loadOutline = getSynchronizedFunction(async (loaded: PDFDocumentProxy) => {
    await getResultAsync(async () => {
      const items = await loaded.getOutline();
      // An outline still loading when another document replaces this one is dropped, as the newer document's stands
      if (loaded === toValue(pdfDocument)) outline.value = items ?? [];
    }).match(noop, console.error);
  });
  const applyDocument = (loaded: PDFDocumentProxy | undefined) => {
    if (!pdfViewer || !linkService || !findController) return;

    pagesCount.value = loaded?.numPages ?? 0;
    overlays.value = [];
    outline.value = [];
    pdfViewer.setDocument(loaded ?? null);
    linkService.setDocument(loaded ?? null);
    // The find controller takes no empty document, so a cleared viewer keeps the last one it searched until it is loaded again
    if (loaded) findController.setDocument(loaded);
    if (loaded) pdfViewer.currentScaleValue = "auto";
    if (!loaded) return;

    loadOutline(loaded);
    const terms = toValue(highlightTerms);
    if (terms.length > 0) findText(terms, "", false);
  };
  // A new query is searched from its first match, and a step to the next or previous one again from where the search is
  const findText = (query: string | string[], type: string, findPrevious: boolean) => {
    eventBus?.dispatch("find", {
      caseSensitive: isMatchCase.value,
      entireWord: isWholeWord.value,
      findPrevious,
      highlightAll: true,
      matchDiacritics: false,
      query,
      type,
    });
  };
  const removePrint = () => {
    printGeneration++;
    printRoot?.remove();
    printRoot = undefined;
  };

  const followBookmark = (item: PdfOutline[number]) => {
    if (item.dest) linkService?.goToDestination(item.dest);
  };
  const goToPage = (pageNumber: number) => {
    if (pdfViewer && Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber <= pagesCount.value)
      pdfViewer.currentPageNumber = pageNumber;
  };
  const previousPage = () => {
    pdfViewer?.previousPage();
  };
  const nextPage = () => {
    pdfViewer?.nextPage();
  };
  const zoomIn = () => {
    pdfViewer?.increaseScale();
  };
  const zoomOut = () => {
    pdfViewer?.decreaseScale();
  };
  const fitWidth = () => {
    if (pdfViewer) pdfViewer.currentScaleValue = "page-width";
  };
  const fitPage = () => {
    if (pdfViewer) pdfViewer.currentScaleValue = "page-fit";
  };
  const actualSize = () => {
    if (pdfViewer) pdfViewer.currentScaleValue = "page-actual";
  };
  const rotate = () => {
    if (pdfViewer) pdfViewer.pagesRotation = (pdfViewer.pagesRotation + PDF_ROTATION_STEP) % PDF_FULL_TURN;
  };
  const findNext = () => {
    findText(searchQuery.value, "again", false);
  };
  const findPrevious = () => {
    findText(searchQuery.value, "again", true);
  };
  const toggleFullscreen = getSynchronizedFunction(async () => {
    const element = containerElement;
    if (!element) return;

    await getResultAsync(async () => {
      if (window.document.fullscreenElement) await window.document.exitFullscreen();
      else await element.requestFullscreen();
    }).match(noop, console.error);
  });
  const download = getSynchronizedFunction(async (filename: string) => {
    const downloaded = toValue(pdfDocument);
    if (!downloaded) return;

    await getResultAsync(async () => {
      saveDocument(filename, await downloaded.getData());
    }).match(noop, console.error);
  });
  const print = getSynchronizedFunction(async () => {
    const printed = toValue(pdfDocument);
    if (!printed) return;

    removePrint();
    const generation = printGeneration;
    await getResultAsync(async () => {
      const sheets = await renderPrintSheets(printed, () => generation !== printGeneration);
      if (!sheets) return;

      window.document.body.append(sheets);
      printRoot = sheets;
      window.print();
    }).match(noop, console.error);
  });

  watch(
    [() => toValue(renderer), () => toValue(container), () => toValue(viewer)],
    ([currentRenderer, containerElementValue, viewerElement]) => {
      if (pdfViewer || !currentRenderer || !containerElementValue || !viewerElement) return;

      createViewer(currentRenderer, containerElementValue, viewerElement);
    },
    { immediate: true },
  );
  watch(
    () => toValue(pdfDocument),
    (loaded) => {
      applyDocument(loaded);
    },
  );
  watch([searchQuery, isMatchCase, isWholeWord], () => {
    findText(searchQuery.value, "", false);
  });
  onScopeDispose(() => {
    removePrint();
    window.document.removeEventListener("fullscreenchange", onFullscreenChange);
    if (!pdfViewer || !containerElement) return;

    window.removeEventListener("afterprint", removePrint);
    containerElement.removeEventListener("pointerdown", onPointerDown);
    containerElement.removeEventListener("pointermove", onPointerMove);
    containerElement.removeEventListener("pointerup", onPointerEnd);
    containerElement.removeEventListener("pointercancel", onPointerEnd);
    containerElement.removeEventListener("pointerleave", onPointerEnd);
    containerElement.removeEventListener("wheel", onWheel);
    resizeObserver?.disconnect();
    pdfViewer.cleanup();
  });

  return {
    actualSize,
    currentPageNumber,
    download,
    fitPage,
    fitWidth,
    findNext,
    findPrevious,
    followBookmark,
    goToPage,
    isFullscreen,
    isMatchCase,
    isNotFound,
    isWholeWord,
    isZoomInDisabled,
    matchesCount,
    nextPage,
    outline,
    overlays,
    pagesCount,
    pagesRotation,
    previousPage,
    print,
    rotate,
    scale,
    searchQuery,
    toggleFullscreen,
    zoomIn,
    zoomOut,
  };
};
