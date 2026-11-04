<script setup lang="ts">
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PdfViewerState } from "vue-pdfjs-headless";

import { usePdfThumbnails } from "vue-pdfjs-headless";

interface Props {
  pdfDocument?: PDFDocumentProxy;
  viewer: PdfViewerState;
}

const { pdfDocument, viewer } = defineProps<Props>();
// A card's canvas is the element the thumbnail draws on, and nothing else a template ref could hand it
const toCanvas = (element: unknown) => (element instanceof HTMLCanvasElement ? element : undefined);
const rail = useTemplateRef("rail");
const { currentPageNumber, goToPage, pagesRotation } = viewer;
// The rail's own scroll is read when the document loads; before then it is the viewport, which clips the same rows
const thumbnails = usePdfThumbnails({
  currentPageNumber,
  pagesRotation,
  pdfDocument: () => pdfDocument,
  root: () => rail.value ?? undefined,
});
const cards = computed(() =>
  thumbnails.value.map((thumbnail) => ({
    isCurrent: thumbnail.isCurrent.value,
    pageNumber: thumbnail.pageNumber,
    thumbnail,
  })),
);
</script>

<template>
  <div ref="rail" flex flex-col gap-2 min-h-0 of-y-auto>
    <button
      v-for="{ isCurrent, pageNumber, thumbnail } of cards"
      :key="pageNumber"
      :aria-current="isCurrent ? 'true' : undefined"
      type="button"
      ui-card
      flex
      flex-col
      gap-1
      items-center
      @click="() => goToPage(pageNumber)"
    >
      <canvas :ref="(element) => (thumbnail.canvas.value = toCanvas(element))" w-full block />
      <span text-sm text-muted>Page {{ pageNumber }}</span>
    </button>
  </div>
</template>
