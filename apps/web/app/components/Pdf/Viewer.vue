<script setup lang="ts">
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import type {
  EventBus,
  PDFFindController,
  PDFLinkService,
  PDFViewer as PdfJsViewer,
} from "pdfjs-dist/web/pdf_viewer.mjs";

import { MimeType } from "#shared/models/file/MimeType";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { downloadFile } from "@/services/app/downloadFile";
import {
  PDF_FULL_TURN,
  PDF_MAX_CANVAS_AREA,
  PDF_MAX_SCALE,
  PDF_PRINT_BATCH_SIZE,
  PDF_PRINT_CLASS,
  PDF_PRINT_SCALE,
  PDF_PRINT_STYLE,
  PDF_ROTATION_STEP,
} from "@/services/pdf/constants";
import { destroyLoadingTask } from "@/services/pdf/destroyLoadingTask";
import { getCanvasScale } from "@/services/pdf/getCanvasScale";
import { loadPdfDocument } from "@/services/pdf/loadPdfDocument";
import { loadPdfViewer } from "@/services/pdf/loadPdfViewer";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

interface Props {
  filename: string;
  url: string;
}

const { filename, url } = defineProps<Props>();
const container = useTemplateRef("container");
const viewer = useTemplateRef("viewer");
const pageInput = ref("");
const pagesCount = ref(0);
const scale = ref(0);
const searchQuery = ref("");
const isMatchCase = ref(false);
const isWholeWord = ref(false);
const matchesCount = ref({ current: 0, total: 0 });
const isNotFound = ref(false);
const isFailed = ref(false);
const isPasswordRequested = ref(false);
const isPasswordWrong = ref(false);
const passwordInput = ref("");
// The renderer's objects, held once the viewer mounts, for the toolbar's handlers to act on
let eventBus: EventBus | undefined;
let pdfViewer: PdfJsViewer | undefined;
let loadingTask: PDFDocumentLoadingTask | undefined;
let loadedDocument: PDFDocumentProxy | undefined;
let submitPasswordCallback: ((password: string) => void) | undefined;
let printContainer: HTMLDivElement | undefined;
// Set on unmount, for a load still waiting on its import, which has no task yet for unmount to destroy
let isUnmounted = false;

const renderPrintImage = async (pdfDocument: PDFDocumentProxy, pageNumber: number) => {
  const page = await pdfDocument.getPage(pageNumber);
  const { height, width } = page.getViewport({ scale: 1 });
  // A page past the largest canvas a device draws is printed at the scale that fits it, since a larger one comes out blank
  const printScale = getCanvasScale({
    cssWidth: width,
    pageHeight: height,
    pageWidth: width,
    pixelRatio: PDF_PRINT_SCALE,
  });
  const viewport = page.getViewport({ scale: printScale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvas, viewport }).promise;

  const image = document.createElement("img");
  image.src = canvas.toDataURL("image/png");
  return image;
};

const previousPage = () => {
  pdfViewer?.previousPage();
};
const nextPage = () => {
  pdfViewer?.nextPage();
};
const goToPage = () => {
  const pageNumber = Number(pageInput.value);
  if (pdfViewer && Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber <= pagesCount.value)
    pdfViewer.currentPageNumber = pageNumber;
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
const submitPassword = () => {
  isPasswordRequested.value = false;
  submitPasswordCallback?.(passwordInput.value);
};
const downloadDocument = getSynchronizedFunction(async () => {
  const downloaded = loadedDocument;
  if (!downloaded) return;

  await getResultAsync(async () => {
    // The original bytes, under the attachment's name: a blob URL from another origin would ignore the name
    const data = await downloaded.getData();
    // The bytes may sit on a shared buffer, which a Blob does not take, so the download is a copy
    downloadFile(filename, new Uint8Array(data), MimeType.Pdf);
  }).match(noop, console.error);
});
const printDocument = getSynchronizedFunction(async () => {
  const printed = loadedDocument;
  if (!printed) return;

  await getResultAsync(async () => {
    const style = document.createElement("style");
    style.textContent = PDF_PRINT_STYLE;
    const printRoot = document.createElement("div");
    printRoot.className = PDF_PRINT_CLASS;
    printRoot.append(style);
    // Each batch renders together and lands in the print container before the next one starts
    for (let firstPageNumber = 1; firstPageNumber <= printed.numPages; firstPageNumber += PDF_PRINT_BATCH_SIZE) {
      const lastPageNumber = Math.min(firstPageNumber + PDF_PRINT_BATCH_SIZE - 1, printed.numPages);
      const pageNumbers = Array.from(
        { length: lastPageNumber - firstPageNumber + 1 },
        (_, index) => firstPageNumber + index,
      );
      printRoot.append(...(await Promise.all(pageNumbers.map((pageNumber) => renderPrintImage(printed, pageNumber)))));
    }
    // A viewer closed while its pages rendered has no dialog left to print from, and a sheet appended now would outlive it
    if (isUnmounted) return;

    document.body.append(printRoot);
    printContainer = printRoot;
    window.print();
  }).match(noop, console.error);
});
const destroyPrintContainer = () => {
  printContainer?.remove();
  printContainer = undefined;
};
const matchesText = computed(() => {
  if (!searchQuery.value) return "";
  if (isNotFound.value) return "No matches";

  return `${matchesCount.value.current} of ${matchesCount.value.total}`;
});

watch(
  () => [searchQuery.value, isMatchCase.value, isWholeWord.value],
  () => findText("", false),
);
onMounted(
  getSynchronizedFunction(async () => {
    const containerElement = container.value;
    const viewerElement = viewer.value;
    if (!url || !containerElement || !viewerElement) return;

    await getResultAsync(async () => {
      const [{ EventBus, FindState, LinkTarget, PDFFindController, PDFLinkService, PDFViewer }, { PasswordResponses }] =
        await Promise.all([loadPdfViewer(), import("pdfjs-dist")]);
      const bus = new EventBus();
      const linkService: PDFLinkService = new PDFLinkService({ eventBus: bus, externalLinkTarget: LinkTarget.BLANK });
      const controller: PDFFindController = new PDFFindController({ eventBus: bus, linkService });
      const instance: PdfJsViewer = new PDFViewer({
        container: containerElement,
        eventBus: bus,
        findController: controller,
        linkService,
        maxCanvasPixels: PDF_MAX_CANVAS_AREA,
        viewer: viewerElement,
      });
      linkService.setViewer(instance);
      eventBus = bus;
      pdfViewer = instance;
      bus.on("pagechanging", (event: { pageNumber: number }) => {
        pageInput.value = String(event.pageNumber);
      });
      bus.on("scalechanging", (event: { scale: number }) => {
        scale.value = event.scale;
      });
      bus.on("updatefindcontrolstate", (event: { matchesCount: { current: number; total: number }; state: number }) => {
        isNotFound.value = event.state === FindState.NOT_FOUND;
        matchesCount.value = event.matchesCount;
      });
      bus.on("updatefindmatchescount", (event: { matchesCount: { current: number; total: number } }) => {
        matchesCount.value = event.matchesCount;
      });

      const task = await loadPdfDocument(url);
      if (isUnmounted) {
        destroyLoadingTask(task);
        return;
      }
      loadingTask = task;
      // The renderer asks again with the reason when a password is wrong, so the prompt says so rather than starting over
      task.onPassword = (updatePassword: (password: string) => void, reason: number) => {
        submitPasswordCallback = updatePassword;
        isPasswordWrong.value = reason === PasswordResponses.INCORRECT_PASSWORD;
        isPasswordRequested.value = true;
      };
      const document = await task.promise;
      loadedDocument = document;
      instance.setDocument(document);
      linkService.setDocument(document);
      controller.setDocument(document);
      pagesCount.value = document.numPages;
      instance.currentScaleValue = "auto";
    }).match(noop, (error) => {
      // Closing the viewer destroys a load still in flight, and its rejection is no failure of the document
      if (isUnmounted) return;

      isFailed.value = true;
      console.error(error);
    });
  }),
);
onUnmounted(() => {
  isUnmounted = true;
  if (loadingTask) destroyLoadingTask(loadingTask);
  loadingTask = undefined;
  destroyPrintContainer();
});
// A fit stays a fit when the container changes width, which pdf.js does not do on its own (#66, #70)
useResizeObserver(container, () => {
  if (pdfViewer) pdfViewer.currentScaleValue = pdfViewer.currentScaleValue;
});
useEventListener("afterprint", destroyPrintContainer);
</script>

<template>
  <div flex flex-col gap-2 min-h-0>
    <div role="toolbar" aria-label="PDF tools" flex flex-wrap items-center gap-2>
      <UiIconButton
        label="Previous page"
        :meaning="UiIconMeaning.Previous"
        :variant="UiButtonVariant.Quiet"
        @click="() => previousPage()"
      />
      <UiTextField v-model="pageInput" label="Page" is-label-hidden :type="UiTextFieldType.Number" w-16 />
      <span text-sm>of {{ pagesCount }}</span>
      <UiButton @click="() => goToPage()">Go</UiButton>
      <UiIconButton
        label="Next page"
        :meaning="UiIconMeaning.Next"
        :variant="UiButtonVariant.Quiet"
        @click="() => nextPage()"
      />
      <UiButton aria-label="Zoom out" @click="() => zoomOut()">−</UiButton>
      <UiButton aria-label="Zoom in" :disabled="scale >= PDF_MAX_SCALE" @click="() => zoomIn()">+</UiButton>
      <UiButton @click="() => fitWidth()">Fit width</UiButton>
      <UiButton @click="() => fitPage()">Fit page</UiButton>
      <UiButton @click="() => actualSize()">Actual size</UiButton>
      <UiButton @click="() => rotate()">Rotate</UiButton>
      <UiButton @click="() => printDocument()">Print</UiButton>
      <UiIconButton
        label="Download"
        :meaning="UiIconMeaning.Download"
        :variant="UiButtonVariant.Quiet"
        @click="() => downloadDocument()"
      />
    </div>
    <div role="search" flex flex-wrap items-center gap-2>
      <UiTextField v-model="searchQuery" label="Search" :type="UiTextFieldType.Search" />
      <UiCheckbox v-model="isMatchCase" label="Match case" is-label-shown />
      <UiCheckbox v-model="isWholeWord" label="Whole word" is-label-shown />
      <UiIconButton
        label="Previous match"
        :meaning="UiIconMeaning.ArrowUp"
        :variant="UiButtonVariant.Quiet"
        @click="() => findText('again', true)"
      />
      <UiIconButton
        label="Next match"
        :meaning="UiIconMeaning.ArrowDown"
        :variant="UiButtonVariant.Quiet"
        @click="() => findText('again', false)"
      />
      <span aria-live="polite" text-sm>{{ matchesText }}</span>
    </div>
    <UiForm v-if="isPasswordRequested" flex flex-wrap items-end gap-2 @submit="() => submitPassword()">
      <UiTextField
        v-model="passwordInput"
        label="Password"
        :error="isPasswordWrong ? 'The password is wrong.' : ''"
        :type="UiTextFieldType.Password"
      />
      <UiButton type="submit" :variant="UiButtonVariant.Accent">Open</UiButton>
    </UiForm>
    <p v-if="isFailed" p-3 text-muted>The PDF could not be loaded.</p>
    <div relative flex-1 min-h-0>
      <div ref="container" absolute inset-0 of-auto>
        <div ref="viewer" class="pdfViewer" />
      </div>
    </div>
  </div>
</template>
