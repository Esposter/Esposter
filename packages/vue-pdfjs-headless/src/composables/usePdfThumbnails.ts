import type { PdfThumbnail } from "#src/models/PdfThumbnail";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { EffectScope, MaybeRefOrGetter, ShallowRef } from "vue";

import { usePdfPage } from "#src/composables/usePdfPage";
import { computed, effectScope, onScopeDispose, ref, shallowRef, toValue, watch } from "vue";

interface UsePdfThumbnailsOptions {
  currentPageNumber: MaybeRefOrGetter<number>;
  pdfDocument: MaybeRefOrGetter<PDFDocumentProxy | undefined>;
  // The sidebar's own scrolling element, whose view decides which rows are in view, read when a document loads
  root: MaybeRefOrGetter<HTMLElement | undefined>;
}

// One thumbnail per page of a loaded document, drawn only while its row is in view of the sidebar and marked current
export const usePdfThumbnails = ({
  currentPageNumber,
  pdfDocument,
  root,
}: UsePdfThumbnailsOptions): ShallowRef<PdfThumbnail[]> => {
  const thumbnails = shallowRef<PdfThumbnail[]>([]);
  // The row each observed canvas belongs to, so a report of its visibility reaches its thumbnail
  const rows = new Map<Element, PdfThumbnail>();
  let observer: IntersectionObserver | undefined;
  let scope: EffectScope | undefined;

  const createThumbnail = (
    pageNumber: number,
    currentDocument: PDFDocumentProxy,
    currentObserver: IntersectionObserver,
  ): PdfThumbnail => {
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
      isVisible: () => isVisible.value,
      pageNumber,
      pdfDocument: currentDocument,
    });
    watch(canvas, (element, _previousElement, onCleanup) => {
      if (!element) return;

      rows.set(element, thumbnail);
      currentObserver.observe(element);
      onCleanup(() => {
        currentObserver.unobserve(element);
        rows.delete(element);
      });
    });

    return thumbnail;
  };

  watch(
    () => toValue(pdfDocument),
    (loaded) => {
      scope?.stop();
      observer?.disconnect();
      rows.clear();
      thumbnails.value = [];
      if (!loaded) return;

      const currentObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const row = rows.get(entry.target);
            if (row) row.isVisible.value = entry.isIntersecting;
          }
        },
        { root: toValue(root) ?? null },
      );
      observer = currentObserver;
      scope = effectScope();
      thumbnails.value =
        scope.run(() =>
          Array.from({ length: loaded.numPages }, (_value, index) =>
            createThumbnail(index + 1, loaded, currentObserver),
          ),
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
