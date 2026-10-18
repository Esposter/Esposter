<script setup lang="ts">
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PdfViewerApi } from "vue-pdfjs-headless";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { loadPdfViewer } from "@/services/pdf/loadPdfViewer";
import { getResultAsync } from "@esposter/shared";
import { usePdfViewer } from "vue-pdfjs-headless";

interface Props {
  filename: string;
  isFailed: boolean;
  isPasswordRequested: boolean;
  isPasswordWrong: boolean;
  pdfDocument?: PDFDocumentProxy;
}

const { filename, isFailed, isPasswordRequested, isPasswordWrong, pdfDocument } = defineProps<Props>();
const emit = defineEmits<{ submitPassword: [password: string] }>();
const container = useTemplateRef("container");
const viewer = useTemplateRef("viewer");
const viewerApi = shallowRef<PdfViewerApi>();
const isViewerFailed = ref(false);
const passwordInput = ref("");
const {
  actualSize,
  currentPageNumber,
  download,
  findNext,
  findPrevious,
  fitPage,
  fitWidth,
  goToPage,
  isMatchCase,
  isNotFound,
  isWholeWord,
  isZoomInDisabled,
  matchesCount,
  nextPage,
  pagesCount,
  previousPage,
  print,
  rotate,
  searchQuery,
  zoomIn,
  zoomOut,
} = usePdfViewer({
  container: () => container.value ?? undefined,
  pdfDocument: () => pdfDocument,
  viewer: () => viewer.value ?? undefined,
  viewerApi: () => viewerApi.value,
});
// The page field follows the page the reader scrolls to, and holds what is typed until Go. No page reads as empty
const { cloned: pageInput } = useCloned(() => (currentPageNumber.value ? String(currentPageNumber.value) : ""));
const matchesText = computed(() => {
  if (!searchQuery.value) return "";
  if (isNotFound.value) return "No matches";

  return `${matchesCount.value.current} of ${matchesCount.value.total}`;
});
const submitPassword = () => {
  emit("submitPassword", passwordInput.value);
};

onMounted(async () => {
  await getResultAsync(loadPdfViewer).match(
    (loaded) => {
      viewerApi.value = loaded;
    },
    (error) => {
      isViewerFailed.value = true;
      console.error(error);
    },
  );
});
</script>

<template>
  <div flex flex-col gap-2 min-h-0>
    <div role="toolbar" aria-label="PDF tools" flex flex-wrap gap-2 items-center>
      <UiIconButton
        label="Previous page"
        :meaning="UiIconMeaning.Previous"
        :variant="UiButtonVariant.Quiet"
        @click="() => previousPage()"
      />
      <UiTextField v-model="pageInput" label="Page" is-label-hidden :type="UiTextFieldType.Number" w-16 />
      <span text-sm>of {{ pagesCount }}</span>
      <UiButton @click="() => goToPage(Number(pageInput))">Go</UiButton>
      <UiIconButton
        label="Next page"
        :meaning="UiIconMeaning.Next"
        :variant="UiButtonVariant.Quiet"
        @click="() => nextPage()"
      />
      <UiButton aria-label="Zoom out" @click="() => zoomOut()">−</UiButton>
      <UiButton aria-label="Zoom in" :disabled="isZoomInDisabled" @click="() => zoomIn()">+</UiButton>
      <UiButton @click="() => fitWidth()">Fit width</UiButton>
      <UiButton @click="() => fitPage()">Fit page</UiButton>
      <UiButton @click="() => actualSize()">Actual size</UiButton>
      <UiButton @click="() => rotate()">Rotate</UiButton>
      <UiButton @click="() => print()">Print</UiButton>
      <UiIconButton
        label="Download"
        :meaning="UiIconMeaning.Download"
        :variant="UiButtonVariant.Quiet"
        @click="() => download(filename)"
      />
    </div>
    <div role="search" flex flex-wrap gap-2 items-center>
      <UiTextField v-model="searchQuery" label="Search" :type="UiTextFieldType.Search" />
      <UiCheckbox v-model="isMatchCase" label="Match case" is-label-shown />
      <UiCheckbox v-model="isWholeWord" label="Whole word" is-label-shown />
      <UiIconButton
        label="Previous match"
        :meaning="UiIconMeaning.ArrowUp"
        :variant="UiButtonVariant.Quiet"
        @click="() => findPrevious()"
      />
      <UiIconButton
        label="Next match"
        :meaning="UiIconMeaning.ArrowDown"
        :variant="UiButtonVariant.Quiet"
        @click="() => findNext()"
      />
      <span aria-live="polite" text-sm>{{ matchesText }}</span>
    </div>
    <UiForm v-if="isPasswordRequested" flex flex-wrap gap-2 items-end @submit="() => submitPassword()">
      <UiTextField
        v-model="passwordInput"
        label="Password"
        :error="isPasswordWrong ? 'The password is wrong.' : ''"
        :type="UiTextFieldType.Password"
      />
      <UiButton type="submit" :variant="UiButtonVariant.Accent">Open</UiButton>
    </UiForm>
    <!-- The document's failure or the viewer's own, since a viewer whose module never came draws no page either -->
    <p v-if="isFailed || isViewerFailed" text-muted p-3>The PDF could not be loaded.</p>
    <div flex-1 min-h-0 relative>
      <div ref="container" inset-0 absolute of-auto>
        <div ref="viewer" class="pdfViewer" />
      </div>
    </div>
  </div>
</template>
