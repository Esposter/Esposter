import type { PdfMatchesCount } from "#src/models/PdfMatchesCount";
import type { PdfOutline } from "#src/models/PdfOutline";
import type { PdfPageOverlay } from "#src/models/PdfPageOverlay";
import type { PdfViewerApi } from "#src/models/PdfViewerApi";
import type { PdfViewerState } from "#src/models/PdfViewerState";
import type { PDFDocumentProxy, PageViewport } from "pdfjs-dist";
import type {
  EventBus as PdfJsEventBus,
  PDFFindController as PdfJsFindController,
  PDFLinkService as PdfJsLinkService,
  PDFViewer as PdfJsViewer,
} from "pdfjs-dist/web/pdf_viewer.mjs";
import type { MaybeRefOrGetter } from "vue";

import { usePdfZoomGesture } from "#src/composables/usePdfZoomGesture";
import {
  PDF_FULL_TURN,
  PDF_MAX_CANVAS_AREA,
  PDF_MAX_SCALE,
  PDF_MIME_TYPE,
  PDF_ROTATION_STEP,
} from "#src/services/constants";
import { renderPrintSheets } from "#src/services/renderPrintSheets";
import { downloadFile, getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";
import { computed, onScopeDispose, ref, shallowRef, toValue, watch } from "vue";

interface UsePdfViewerOptions {
  container: MaybeRefOrGetter<HTMLDivElement | undefined>;
  // The terms highlighted on load, every match of each one
  highlightTerms?: MaybeRefOrGetter<string[]>;
  pdfDocument: MaybeRefOrGetter<PDFDocumentProxy | undefined>;
  viewer: MaybeRefOrGetter<HTMLDivElement | undefined>;
  // The renderer's viewer module, the components its viewer is built from
  viewerApi: MaybeRefOrGetter<PdfViewerApi | undefined>;
}

// Builds the renderer's viewer for a loaded document on the consumer's container.
// Its pages, zoom, rotation, search, download and print are state and actions, and it draws no chrome
export const usePdfViewer = ({
  container,
  highlightTerms = [],
  pdfDocument,
  viewer,
  viewerApi,
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
  let abortController: AbortController | undefined;
  let containerElement: HTMLDivElement | undefined;
  let eventBus: PdfJsEventBus | undefined;
  let findController: PdfJsFindController | undefined;
  let linkService: PdfJsLinkService | undefined;
  let pdfViewer: PdfJsViewer | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let printRoot: HTMLDivElement | undefined;
  // Bumped by every print and by the scope's end, so a print still drawing stops before it reaches the page
  let printGeneration = 0;

  const onFullscreenChange = () => {
    isFullscreen.value = window.document.fullscreenElement === containerElement;
  };
  const createViewer = (
    currentViewerApi: PdfViewerApi,
    containerValue: HTMLDivElement,
    viewerElement: HTMLDivElement,
  ) => {
    const { EventBus, FindState, LinkTarget, PDFFindController, PDFLinkService, PDFViewer } = currentViewerApi;
    const bus = new EventBus();
    const links = new PDFLinkService({ eventBus: bus, externalLinkTarget: LinkTarget.BLANK });
    const controller = new PDFFindController({ eventBus: bus, linkService: links });
    // One signal per viewer, so the viewer's own listeners and the ones added here end together
    const viewerAbortController = new AbortController();
    const { signal } = viewerAbortController;
    const instance = new PDFViewer({
      abortSignal: signal,
      container: containerValue,
      eventBus: bus,
      findController: controller,
      linkService: links,
      maxCanvasPixels: PDF_MAX_CANVAS_AREA,
      viewer: viewerElement,
    });
    links.setViewer(instance);
    abortController = viewerAbortController;
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
      // Before a document sets a scale, pdf.js reports the value as null, which it rejects as an unknown zoom value
      if (currentScaleValue) pdfViewer.currentScaleValue = currentScaleValue;
    });
    resizeObserver.observe(containerValue);
    window.document.addEventListener("fullscreenchange", onFullscreenChange, { signal });
    window.addEventListener("afterprint", removePrint, { signal });
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
    // The renderer resets its page and rotation without an event, and the find controller reports nothing on reset.
    // So a document that replaces another starts from the state a new viewer has.
    currentPageNumber.value = 1;
    pagesRotation.value = 0;
    matchesCount.value = { current: 0, total: 0 };
    isNotFound.value = false;
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
      // The bytes may sit on a shared buffer, which a Blob does not take, so the download is a copy
      downloadFile(filename, new Uint8Array(await downloaded.getData()), PDF_MIME_TYPE);
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

  usePdfZoomGesture({ container, getViewer: () => pdfViewer });
  watch(
    [() => toValue(viewerApi), () => toValue(container), () => toValue(viewer)],
    ([currentViewerApi, containerElementValue, viewerElement]) => {
      if (pdfViewer || !currentViewerApi || !containerElementValue || !viewerElement) return;

      createViewer(currentViewerApi, containerElementValue, viewerElement);
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
    if (!pdfViewer) return;

    // Clearing the document first lets the renderer cancel what it draws, and aborting then releases its listeners
    pdfViewer.setDocument(null);
    abortController?.abort();
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
