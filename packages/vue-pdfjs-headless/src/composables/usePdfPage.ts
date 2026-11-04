import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import type { MaybeRefOrGetter } from "vue";

import { getCanvasScale } from "#src/services/getCanvasScale";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";
import { onScopeDispose, ref, toValue, watch } from "vue";

interface UsePdfPageOptions {
  canvas: MaybeRefOrGetter<HTMLCanvasElement | undefined>;
  // Whether the page is wanted. It loads the first time it is, and once loaded it stays loaded, so a row that leaves
  // View keeps its page
  isActive?: MaybeRefOrGetter<boolean>;
  isVisible?: MaybeRefOrGetter<boolean>;
  pageNumber: MaybeRefOrGetter<number>;
  pagesRotation?: MaybeRefOrGetter<number>;
  pdfDocument: MaybeRefOrGetter<PDFDocumentProxy | undefined>;
}

// Draws one page of a loaded document into a canvas the consumer renders.
// The page is drawn at the canvas's width times the device's pixel ratio.
// A width change starts a fresh draw, which supersedes the one still running
export const usePdfPage = ({
  canvas,
  isActive = true,
  isVisible = true,
  pageNumber,
  pagesRotation = 0,
  pdfDocument,
}: UsePdfPageOptions): void => {
  // Zero until the observer reports a width, so a page is never drawn at no width
  let cssWidth = 0;
  // Bumped by every new page or document, so a page still loading is dropped rather than drawn over the newer one
  let loadGeneration = 0;
  let page: PDFPageProxy | undefined;
  let renderTask: RenderTask | undefined;

  const awaitRender = getSynchronizedFunction(async (task: RenderTask) => {
    await getResultAsync(() => task.promise).match(noop, (error) => {
      // A draw a newer one cancelled rejects too, and it is the newer draw that stands
      if (task === renderTask) console.error(error);
    });
  });
  const cancelRender = () => {
    renderTask?.cancel();
    renderTask = undefined;
  };
  const drawPage = () => {
    const currentCanvas = toValue(canvas);
    if (!page || !currentCanvas || cssWidth === 0 || !toValue(isVisible)) return;

    // A newer draw replaces the one in flight, since pdf.js drawing two renders onto one canvas leaves it half drawn
    cancelRender();
    // The viewer's turn adds to the page's own /Rotate, since pdf.js takes a given rotation in place of the page's own
    const rotation = (page.rotate + toValue(pagesRotation)) % 360;
    const { height, width } = page.getViewport({ rotation, scale: 1 });
    const viewport = page.getViewport({
      rotation,
      scale: getCanvasScale({ cssWidth, pageHeight: height, pageWidth: width, pixelRatio: window.devicePixelRatio }),
    });
    currentCanvas.width = viewport.width;
    currentCanvas.height = viewport.height;
    const task = page.render({ canvas: currentCanvas, viewport });
    renderTask = task;
    awaitRender(task);
  };

  // Latched by the first report that the page is wanted, so loading starts then and the page leaving view never undoes it
  const isWanted = ref(false);
  watch(
    () => toValue(isActive),
    (active) => {
      if (active) isWanted.value = true;
    },
    { immediate: true },
  );
  watch(
    [() => toValue(pdfDocument), () => toValue(pageNumber), isWanted],
    getSynchronizedFunction(async ([currentDocument, currentPageNumber, currentIsWanted]) => {
      const generation = ++loadGeneration;
      cancelRender();
      page = undefined;
      if (!currentDocument || !currentIsWanted) return;

      await getResultAsync(async () => {
        const loadedPage = await currentDocument.getPage(currentPageNumber);
        if (generation !== loadGeneration) return;

        page = loadedPage;
        drawPage();
      }).match(noop, (error) => {
        if (generation === loadGeneration) console.error(error);
      });
    }),
    { immediate: true },
  );
  watch(
    () => toValue(canvas),
    (currentCanvas, _previousCanvas, onCleanup) => {
      // A draw in flight onto a removed canvas is cancelled, so it does not rasterise into a detached element
      if (!currentCanvas) {
        cancelRender();
        return;
      }

      // A new element's first report is its own width, which may equal the last canvas's, so the width is not remembered across elements
      cssWidth = 0;
      const observer = new ResizeObserver((entries) => {
        // A report that keeps the width is the canvas resizing its own height, which must not draw the page again
        const width = entries[0]?.contentRect.width ?? 0;
        if (width === cssWidth) return;

        cssWidth = width;
        drawPage();
      });
      observer.observe(currentCanvas);
      onCleanup(() => {
        observer.disconnect();
      });
    },
    { immediate: true },
  );
  watch(
    () => toValue(isVisible),
    (visible) => {
      if (visible) drawPage();
    },
  );
  watch(
    () => toValue(pagesRotation),
    () => {
      drawPage();
    },
  );
  onScopeDispose(() => {
    loadGeneration++;
    cancelRender();
    // The renderer caches a page's proxy for the document's life, and its own viewer releases the proxy once the page is no longer drawn
    page?.cleanup();
  });
};
