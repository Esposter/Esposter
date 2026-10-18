<script setup lang="ts">
import type { PDFDocumentLoadingTask, PDFPageProxy, RenderTask } from "pdfjs-dist";

import { getCanvasScale } from "@/services/pdf/getCanvasScale";
import { loadPdfDocument } from "@/services/pdf/loadPdfDocument";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

interface Props {
  url: string;
}

const { url } = defineProps<Props>();
const container = useTemplateRef("container");
const canvas = useTemplateRef("canvas");
const isFailed = ref(false);
// Zero until the observer reports a width, so a page is never drawn at no width
let cssWidth = 0;
let loadingTask: PDFDocumentLoadingTask | undefined;
let firstPage: PDFPageProxy | undefined;
let renderTask: RenderTask | undefined;

const awaitRender = getSynchronizedFunction(async (task: RenderTask) => {
  await getResultAsync(() => task.promise).match(noop, (error) => {
    // A draw a newer one cancelled rejects too, and it is the newer draw that stands
    if (task === renderTask) console.error(error);
  });
});
const destroyLoadingTask = getSynchronizedFunction(async (task: PDFDocumentLoadingTask) => {
  await task.destroy();
});

const drawPage = () => {
  if (!firstPage || !canvas.value || cssWidth === 0) return;
  // A newer draw replaces the one in flight, since pdf.js drawing two renders onto one canvas leaves it half drawn
  renderTask?.cancel();
  const { height, width } = firstPage.getViewport({ scale: 1 });
  const viewport = firstPage.getViewport({
    scale: getCanvasScale({ cssWidth, pageHeight: height, pageWidth: width, pixelRatio: window.devicePixelRatio }),
  });
  canvas.value.width = viewport.width;
  canvas.value.height = viewport.height;
  const canvasContext = canvas.value.getContext("2d");
  if (!canvasContext) return;

  const task = firstPage.render({ canvasContext, viewport });
  renderTask = task;
  awaitRender(task);
};
const loadFirstPage = async () => {
  if (!url) return;

  isFailed.value = false;
  await getResultAsync(async () => {
    const task = await loadPdfDocument(url);
    loadingTask = task;
    const pdfDocument = await task.promise;
    const page = await pdfDocument.getPage(1);
    if (loadingTask === task) firstPage = page;
  }).match(drawPage, (error) => {
    isFailed.value = true;
    console.error(error);
  });
};
const unload = () => {
  renderTask?.cancel();
  renderTask = undefined;
  firstPage = undefined;
  if (loadingTask) destroyLoadingTask(loadingTask);
  loadingTask = undefined;
};
const reload = async () => {
  unload();
  await loadFirstPage();
};

onMounted(getSynchronizedFunction(loadFirstPage));
watch(() => url, getSynchronizedFunction(reload));
onUnmounted(unload);
useResizeObserver(container, (entries) => {
  cssWidth = entries[0]?.contentRect.width ?? 0;
  drawPage();
});
</script>

<template>
  <div ref="container" of-hidden w-full>
    <canvas v-show="!isFailed" ref="canvas" block w-full />
    <p v-if="isFailed" p-3 text-sm text-muted>The PDF could not be loaded.</p>
  </div>
</template>
