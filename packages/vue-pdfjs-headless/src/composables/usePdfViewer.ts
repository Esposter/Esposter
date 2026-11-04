import type { PdfMatchesCount } from "#src/models/PdfMatchesCount";
import type { PdfOutline } from "#src/models/PdfOutline";
import type { PdfPageOverlay } from "#src/models/PdfPageOverlay";
import type { PdfViewerApi } from "#src/models/PdfViewerApi";
import type { PdfViewerState } from "#src/models/PdfViewerState";
import type { AnnotationEditorUIManager, PageViewport, PDFDocumentProxy } from "pdfjs-dist";
import type {
  EventBus as PdfJsEventBus,
  PDFLinkService as PdfJsLinkService,
  PDFViewer as PdfJsViewer,
} from "pdfjs-dist/web/pdf_viewer.mjs";
import type { MaybeRefOrGetter } from "vue";

import { usePdfZoomGesture } from "#src/composables/usePdfZoomGesture";
import { PdfEditorMode } from "#src/models/PdfEditorMode";
import {
  PDF_FULL_TURN,
  PDF_MAX_CANVAS_AREA,
  PDF_MAX_SCALE,
  PDF_MIME_TYPE,
  PDF_MIN_SCALE,
  PDF_OPENING_SCALE,
  PDF_ZOOM_STEP,
} from "#src/services/constants";
import { getDownloadBytes } from "#src/services/getDownloadBytes";
import { renderPrintSheets } from "#src/services/renderPrintSheets";
import { downloadFile, getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";
import { computed, onScopeDispose, ref, shallowRef, toValue, watch } from "vue";

interface FindTextOptions {
  isPrevious?: boolean;
  query: string | string[];
  type?: string;
}

interface UsePdfViewerOptions {
  container: MaybeRefOrGetter<HTMLDivElement | undefined>;
  // The terms highlighted on load, searched as one phrase with the terms joined by a space
  highlightTerms?: MaybeRefOrGetter<string[]>;
  // The URL the renderer's annotation icons are served from, ending in a slash.
  // The renderer asks for each icon by its name beside this URL, so a path it is not given is requested from the page's root.
  imageResourcesPath: string;
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
  imageResourcesPath,
  pdfDocument,
  viewer,
  viewerApi,
}: UsePdfViewerOptions): PdfViewerState => {
  const currentPageNumber = ref(0);
  const editorMode = ref(PdfEditorMode.None);
  const isMatchCase = ref(false);
  const isNotFound = ref(false);
  const isWholeWord = ref(false);
  const matchesCount = ref<PdfMatchesCount>({ current: 0, total: 0 });
  // Undefined until the document's outline has been read, so a tab shows loading rather than an empty outline
  const outline = shallowRef<PdfOutline>();
  const overlays = shallowRef<PdfPageOverlay[]>([]);
  const pagesCount = ref(0);
  const pagesRotation = ref(0);
  const scale = ref(0);
  const searchQuery = ref("");
  // Bumped with each document, so the search runs on a new document even when its terms are the last one's
  const documentGeneration = ref(0);
  const isZoomInDisabled = computed(() => scale.value >= PDF_MAX_SCALE);
  const isZoomOutDisabled = computed(() => scale.value <= PDF_MIN_SCALE);
  let abortController: AbortController | undefined;
  let eventBus: PdfJsEventBus | undefined;
  let linkService: PdfJsLinkService | undefined;
  let pdfViewer: PdfJsViewer | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let printRoot: HTMLDivElement | undefined;
  // Bumped by every print and by the scope's end, so a print still drawing stops before it reaches the page
  let printGeneration = 0;
  // The renderer makes its editor manager once a document's first page is read, and a new document replaces it.
  // A mode set while there is no manager throws, and a throw in a watcher freezes this viewer's rendering.
  // So the mode is set only once the renderer reports its manager, which is also what the stored editors are drawn through.
  // A document whose permissions withhold changes is never given one, so it is not editable.
  const editorManager = shallowRef<AnnotationEditorUIManager>();
  const isEditable = computed(() => editorManager.value !== undefined);
  const applyEditorMode = () => {
    if (pdfViewer && editorManager.value) pdfViewer.annotationEditorMode = { mode: editorMode.value };
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
    // @TODO: no upstream issue — pdf.js's PDFViewerOptions typedef omits the abortSignal PDFViewer's constructor reads, so the options are typed with it added
    const viewerOptions: ConstructorParameters<typeof PdfJsViewer>[0] & { abortSignal: AbortSignal } = {
      abortSignal: signal,
      container: containerValue,
      eventBus: bus,
      findController: controller,
      imageResourcesPath,
      linkService: links,
      maxCanvasPixels: PDF_MAX_CANVAS_AREA,
      viewer: viewerElement,
    };
    const instance = new PDFViewer(viewerOptions);
    links.setViewer(instance);
    abortController = viewerAbortController;
    eventBus = bus;
    linkService = links;
    pdfViewer = instance;
    // The renderer takes a preset scale only once its pages exist, which pagesinit announces
    bus.on("pagesinit", () => {
      instance.currentScaleValue = PDF_OPENING_SCALE;
    });
    // The renderer reports each editor manager it makes, which is the first point its mode can be set.
    // A new manager starts in none, so the mode the reader chose is set again on each document.
    bus.on("annotationeditoruimanager", (event: { uiManager: AnnotationEditorUIManager }) => {
      editorManager.value = event.uiManager;
      applyEditorMode();
    });
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
    window.addEventListener(
      "afterprint",
      () => {
        removePrint();
      },
      { signal },
    );
    applyDocument(toValue(pdfDocument));
  };
  const loadOutline = getSynchronizedFunction(async (loaded: PDFDocumentProxy) => {
    await getResultAsync(async () => {
      const items = await loaded.getOutline();
      // An outline still loading when another document replaces this one is dropped, as the newer document's stands
      if (loaded === toValue(pdfDocument)) outline.value = items ?? [];
    }).match(noop, (error) => {
      console.error(error);
      // An outline that cannot be read is an empty one, so its tab says so rather than loading for ever
      if (loaded === toValue(pdfDocument)) outline.value = [];
    });
  });
  const applyDocument = (loaded: PDFDocumentProxy | undefined) => {
    if (!pdfViewer || !linkService) return;

    pagesCount.value = loaded?.numPages ?? 0;
    overlays.value = [];
    outline.value = undefined;
    // Setting the document replaces the renderer's editor manager, so its mode waits for the next one's report
    editorManager.value = undefined;
    pdfViewer.setDocument(loaded ?? null);
    linkService.setDocument(loaded ?? null);
    // The renderer resets its page and rotation without an event, and the find controller reports nothing on reset.
    // So a document that replaces another starts from the state a new viewer has.
    currentPageNumber.value = 1;
    pagesRotation.value = 0;
    // The search starts over with the document: its query and matches are cleared, and the terms it opens with are searched
    searchQuery.value = "";
    matchesCount.value = { current: 0, total: 0 };
    isNotFound.value = false;
    if (!loaded) return;

    loadOutline(loaded);
    // The terms are one phrase the search bar shows, so the highlight and the bar's Next and Previous search the same query
    searchQuery.value = toValue(highlightTerms).join(" ");
    documentGeneration.value++;
  };
  // A new query is searched from its first match, and a step to the next or previous one again from where the search is
  const findText = ({ isPrevious = false, query, type = "" }: FindTextOptions) => {
    eventBus?.dispatch("find", {
      caseSensitive: isMatchCase.value,
      entireWord: isWholeWord.value,
      findPrevious: isPrevious,
      highlightAll: true,
      matchDiacritics: false,
      query,
      type,
    });
  };
  // Registered before the viewer is created, since a document loaded during setup bumps the generation this watches
  // A search runs again when its query or options change, and when a document loads, which searches the terms it opens with
  watch([searchQuery, isMatchCase, isWholeWord, documentGeneration], () => {
    if (toValue(pdfDocument)) findText({ query: searchQuery.value });
  });
  const removePrint = () => {
    printGeneration++;
    printRoot?.remove();
    printRoot = undefined;
  };

  const followBookmark = getSynchronizedFunction(async (item: PdfOutline[number]) => {
    await getResultAsync(async () => {
      if (item.dest) await linkService?.goToDestination(item.dest);
    }).match(noop, console.error);
  });
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
  // A step from the current scale, held to the package's own range, since pdf.js would hold it to its wider one
  const zoomTo = (nextScale: number) => {
    if (pdfViewer) pdfViewer.currentScale = Math.min(Math.max(nextScale, PDF_MIN_SCALE), PDF_MAX_SCALE);
  };
  const zoomIn = () => {
    if (pdfViewer && pdfViewer.currentScale > 0) zoomTo(pdfViewer.currentScale * PDF_ZOOM_STEP);
  };
  const zoomOut = () => {
    if (pdfViewer && pdfViewer.currentScale > 0) zoomTo(pdfViewer.currentScale / PDF_ZOOM_STEP);
  };
  // The zoom readout's reset: the scale a document opens in, which is not the actual size that the menu's item sets
  const resetZoom = () => {
    if (pdfViewer) pdfViewer.currentScaleValue = PDF_OPENING_SCALE;
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
  // A turn of any number of degrees from the current rotation, wrapping after a full turn in either direction
  const rotate = (degrees: number) => {
    if (pdfViewer)
      pdfViewer.pagesRotation = (((pdfViewer.pagesRotation + degrees) % PDF_FULL_TURN) + PDF_FULL_TURN) % PDF_FULL_TURN;
  };
  const findNext = () => {
    findText({ query: searchQuery.value, type: "again" });
  };
  const findPrevious = () => {
    findText({ isPrevious: true, query: searchQuery.value, type: "again" });
  };
  // The watermark is the text stamped on every page of this one download, which the pages on screen never carry
  const download = getSynchronizedFunction(async (filename: string, watermark?: string) => {
    const downloaded = toValue(pdfDocument);
    if (!downloaded) return;

    await getResultAsync(async () => {
      downloadFile(filename, await getDownloadBytes(downloaded, watermark), PDF_MIME_TYPE);
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

  // The renderer restores a stored editor onto its page when the page renders, so each rendered page is restored now
  const drawStoredEditors = getSynchronizedFunction(async () => {
    const manager = editorManager.value;
    if (!manager) return;

    await getResultAsync(async () => {
      await Promise.all(
        Array.from({ length: pagesCount.value }, async (_value, pageIndex) => {
          const layer = manager.getLayer(pageIndex);
          if (!layer) return;

          await manager.findClonesForPage(layer);
          // The renderer hides a layer that holds no editor, so a page that holds one now is shown
          layer.div.hidden = layer.isEmpty;
        }),
      );
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
  // A mode chosen before the renderer has its editor manager is set when the manager is reported
  watch(editorMode, applyEditorMode);
  onScopeDispose(() => {
    removePrint();
    if (!pdfViewer) return;

    // Clearing the document first cancels what the renderer draws and drops its pages, and aborting then releases its
    // Listeners
    pdfViewer.setDocument(null);
    abortController?.abort();
    resizeObserver?.disconnect();
  });

  return {
    actualSize,
    currentPageNumber,
    download,
    drawStoredEditors,
    editorMode,
    findNext,
    findPrevious,
    fitPage,
    fitWidth,
    followBookmark,
    goToPage,
    isEditable,
    isMatchCase,
    isNotFound,
    isWholeWord,
    isZoomInDisabled,
    isZoomOutDisabled,
    matchesCount,
    nextPage,
    outline,
    overlays,
    pagesCount,
    pagesRotation,
    previousPage,
    print,
    resetZoom,
    rotate,
    scale,
    searchQuery,
    zoomIn,
    zoomOut,
  };
};
