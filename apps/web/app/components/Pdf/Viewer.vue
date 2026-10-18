<script setup lang="ts">
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PdfRenderer } from "vue-pdfjs-headless";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { usePdfViewer } from "vue-pdfjs-headless";

interface Props {
  filename: string;
  isFailed: boolean;
  isPasswordRequested: boolean;
  isPasswordWrong: boolean;
  pdfDocument?: PDFDocumentProxy;
  renderer?: PdfRenderer;
}

const { filename, isFailed, isPasswordRequested, isPasswordWrong, pdfDocument, renderer } = defineProps<Props>();
const emit = defineEmits<{ submitPassword: [password: string] }>();
const container = useTemplateRef("container");
const viewer = useTemplateRef("viewer");
const pageInput = ref("");
const passwordInput = ref("");
const {
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
  previousPage,
  print,
  rotate,
  searchQuery,
  zoomIn,
  zoomOut,
} = usePdfViewer({
  container: () => container.value ?? undefined,
  pdfDocument: () => pdfDocument,
  renderer: () => renderer,
  viewer: () => viewer.value ?? undefined,
});
const matchesText = computed(() => {
  if (!searchQuery.value) return "";
  if (isNotFound.value) return "No matches";

  return `${matchesCount.value.current} of ${matchesCount.value.total}`;
});
const submitPassword = () => {
  emit("submitPassword", passwordInput.value);
};

watch(currentPageNumber, (pageNumber) => {
  pageInput.value = String(pageNumber);
});
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
    <div role="search" flex flex-wrap items-center gap-2>
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
