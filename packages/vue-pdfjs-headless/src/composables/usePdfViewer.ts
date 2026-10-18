import type { PdfMatchesCount } from "#src/models/PdfMatchesCount";
import type { PdfRenderer } from "#src/models/PdfRenderer";
import type { PdfViewerState } from "#src/models/PdfViewerState";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type {
  EventBus as PdfJsEventBus,
  PDFFindController as PdfJsFindController,
  PDFLinkService as PdfJsLinkService,
  PDFViewer as PdfJsViewer,
} from "pdfjs-dist/web/pdf_viewer.mjs";
import type { MaybeRefOrGetter } from "vue";

import { PDF_FULL_TURN, PDF_MAX_CANVAS_AREA, PDF_MAX_SCALE, PDF_ROTATION_STEP } from "#src/services/constants";
import { renderPrintSheets } from "#src/services/renderPrintSheets";
import { saveDocument } from "#src/services/saveDocument";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";
import { computed, onScopeDispose, ref, toValue, watch } from "vue";

interface UsePdfViewerOptions {
  container: MaybeRefOrGetter<HTMLDivElement | undefined>;
  pdfDocument: MaybeRefOrGetter<PDFDocumentProxy | undefined>;
  renderer: MaybeRefOrGetter<PdfRenderer | undefined>;
  viewer: MaybeRefOrGetter<HTMLDivElement | undefined>;
}

// Builds the renderer's viewer for a loaded document on the consumer's container.
// Its pages, zoom, rotation, search, download and print are state and actions, and it draws no chrome
export const usePdfViewer = ({ container, pdfDocument, renderer, viewer }: UsePdfViewerOptions): PdfViewerState => {
  const currentPageNumber = ref(0);
  const isMatchCase = ref(false);
  const isNotFound = ref(false);
  const isWholeWord = ref(false);
  const matchesCount = ref<PdfMatchesCount>({ current: 0, total: 0 });
  const pagesCount = ref(0);
  const pagesRotation = ref(0);
  const scale = ref(0);
  const searchQuery = ref("");
  const isZoomInDisabled = computed(() => scale.value >= PDF_MAX_SCALE);
  let eventBus: PdfJsEventBus | undefined;
  let findController: PdfJsFindController | undefined;
  let linkService: PdfJsLinkService | undefined;
  let pdfViewer: PdfJsViewer | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let printRoot: HTMLDivElement | undefined;
  // Bumped by every print and by the scope's end, so a print still drawing stops before it reaches the page
  let printGeneration = 0;

  const createViewer = (
    currentRenderer: PdfRenderer,
    containerElement: HTMLDivElement,
    viewerElement: HTMLDivElement,
  ) => {
    const { EventBus, FindState, LinkTarget, PDFFindController, PDFLinkService, PDFViewer } = currentRenderer.viewer;
    const bus = new EventBus();
    const links = new PDFLinkService({ eventBus: bus, externalLinkTarget: LinkTarget.BLANK });
    const controller = new PDFFindController({ eventBus: bus, linkService: links });
    const instance = new PDFViewer({
      container: containerElement,
      eventBus: bus,
      findController: controller,
      linkService: links,
      maxCanvasPixels: PDF_MAX_CANVAS_AREA,
      viewer: viewerElement,
    });
    links.setViewer(instance);
    eventBus = bus;
    findController = controller;
    linkService = links;
    pdfViewer = instance;
    bus.on("pagechanging", (event: { pageNumber: number }) => {
      currentPageNumber.value = event.pageNumber;
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
    resizeObserver.observe(containerElement);
    window.addEventListener("afterprint", removePrint);
    applyDocument(toValue(pdfDocument));
  };
  const applyDocument = (loaded: PDFDocumentProxy | undefined) => {
    if (!pdfViewer || !linkService || !findController) return;

    pagesCount.value = loaded?.numPages ?? 0;
    pdfViewer.setDocument(loaded ?? null);
    linkService.setDocument(loaded ?? null);
    // The find controller takes no empty document, so a cleared viewer keeps the last one it searched until it is loaded again
    if (loaded) findController.setDocument(loaded);
    if (loaded) pdfViewer.currentScaleValue = "auto";
  };
  // A new query is searched from its first match, and a step to the next or previous one again from where the search is
  const findText = (type: string, findPrevious: boolean) => {
    eventBus?.dispatch("find", {
      caseSensitive: isMatchCase.value,
      entireWord: isWholeWord.value,
      findPrevious,
      highlightAll: true,
      matchDiacritics: false,
      query: searchQuery.value,
      type,
    });
  };
  const removePrint = () => {
    printGeneration++;
    printRoot?.remove();
    printRoot = undefined;
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
    findText("again", false);
  };
  const findPrevious = () => {
    findText("again", true);
  };
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
    ([currentRenderer, containerElement, viewerElement]) => {
      if (pdfViewer || !currentRenderer || !containerElement || !viewerElement) return;

      createViewer(currentRenderer, containerElement, viewerElement);
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
    findText("", false);
  });
  onScopeDispose(() => {
    removePrint();
    if (!pdfViewer) return;

    window.removeEventListener("afterprint", removePrint);
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
    goToPage,
    isMatchCase,
    isNotFound,
    isWholeWord,
    isZoomInDisabled,
    matchesCount,
    nextPage,
    pagesCount,
    pagesRotation,
    previousPage,
    print,
    rotate,
    scale,
    searchQuery,
    zoomIn,
    zoomOut,
  };
};
