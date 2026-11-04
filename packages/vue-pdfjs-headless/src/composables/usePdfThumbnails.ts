import type { PdfThumbnail } from "#src/models/PdfThumbnail";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { EffectScope, MaybeRefOrGetter, ShallowRef } from "vue";

import { usePdfPage } from "#src/composables/usePdfPage";
import { computed, effectScope, onScopeDispose, ref, shallowRef, toValue, watch } from "vue";

interface UsePdfThumbnailsOptions {
  currentPageNumber: MaybeRefOrGetter<number>;
  // The viewer's rotation, which every thumbnail turns with so the rail shows the pages as the viewer does
  pagesRotation: MaybeRefOrGetter<number>;
  pdfDocument: MaybeRefOrGetter<PDFDocumentProxy | undefined>;
  // The sidebar's own scrolling element, whose view decides which rows are in view. It may mount after the document
  // Loads, so the observer is made against it whenever it changes
  root: MaybeRefOrGetter<HTMLElement | undefined>;
}

// One thumbnail per page of a loaded document, its page loaded and drawn only while its row is in view of the sidebar,
// And marked current
export const usePdfThumbnails = ({
  currentPageNumber,
  pagesRotation,
  pdfDocument,
  root,
}: UsePdfThumbnailsOptions): ShallowRef<PdfThumbnail[]> => {
  const thumbnails = shallowRef<PdfThumbnail[]>([]);
  // The row each observed canvas belongs to, so a report of its visibility reaches its thumbnail
  const rows = new Map<Element, PdfThumbnail>();
  let observer: IntersectionObserver | undefined;
  let scope: EffectScope | undefined;

  const createThumbnail = (pageNumber: number, currentDocument: PDFDocumentProxy): PdfThumbnail => {
    const canvas = shallowRef<HTMLCanvasElement | undefined>();
    const isVisible = ref(false);
    const thumbnail: PdfThumbnail = {
      canvas,
      isCurrent: computed(() => toValue(currentPageNumber) === pageNumber),
      isVisible,
      pageNumber,
    };
    usePdfPage({
      canvas: () => canvas.value,
      // The row's visibility is the one signal, so a page loads once its row is first in view and is drawn while it is
      isActive: () => isVisible.value,
      isVisible: () => isVisible.value,
      pageNumber,
      pagesRotation: () => toValue(pagesRotation),
      pdfDocument: currentDocument,
    });
    watch(canvas, (element, _previousElement, onCleanup) => {
      if (!element) return;

      rows.set(element, thumbnail);
      observer?.observe(element);
      onCleanup(() => {
        observer?.unobserve(element);
        rows.delete(element);
      });
    });

    return thumbnail;
  };

  // The observer the rows are watched through, made again each time the sidebar's element changes, and each row it watches
  // Is watched again by the new one
  watch(
    () => toValue(root),
    (rootElement) => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const row = rows.get(entry.target);
            if (row) row.isVisible.value = entry.isIntersecting;
          }
        },
        { root: rootElement ?? null },
      );
      for (const element of rows.keys()) observer.observe(element);
    },
    { immediate: true },
  );
  watch(
    () => toValue(pdfDocument),
    (loaded) => {
      scope?.stop();
      rows.clear();
      thumbnails.value = [];
      if (!loaded) return;

      scope = effectScope();
      thumbnails.value =
        scope.run(() =>
          Array.from({ length: loaded.numPages }, (_value, index) => createThumbnail(index + 1, loaded)),
        ) ?? [];
    },
    { immediate: true },
  );
  onScopeDispose(() => {
    scope?.stop();
    observer?.disconnect();
  });

  return thumbnails;
};
