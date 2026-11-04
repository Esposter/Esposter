<script setup lang="ts">
import type { PDFDocumentProxy } from "pdfjs-dist";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { loadPdfViewer } from "@/services/pdf/loadPdfViewer";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { usePdfViewer } from "vue-pdfjs-headless";

interface Props {
  filename: string;
  // The terms highlighted in the document when it loads, searched as one phrase with the terms joined by a space. A caller
  // Opening the viewer from a search passes the terms it searched for
  highlightTerms?: string[];
  isFailed: boolean;
  isPasswordRequested: boolean;
  isPasswordWrong: boolean;
  pdfDocument?: PDFDocumentProxy;
}

const {
  filename,
  highlightTerms = [],
  isFailed,
  isPasswordRequested,
  isPasswordWrong,
  pdfDocument,
} = defineProps<Props>();
const emit = defineEmits<{ submitPassword: [password: string] }>();
const container = useTemplateRef("container");
const viewer = useTemplateRef("viewer");
const passwordInput = ref("");
// The viewer's module loads as the component mounts, and a viewer whose module never came draws no page either
const { isFailed: isViewerFailed, loaded: viewerApi } = useLazyLoad(loadPdfViewer);
const state = usePdfViewer({
  container: () => container.value ?? undefined,
  highlightTerms: () => highlightTerms,
  pdfDocument: () => pdfDocument,
  viewer: () => viewer.value ?? undefined,
  viewerApi: () => viewerApi.value,
});
// The sidebar is open on a screen wide enough to hold it beside the pages, and a phone keeps it shut until the reader
// Opens it. The reader's own choice is kept with the browser once made
const { mdAndDown } = useUiDisplay();
const isSidebarOpen = useLocalStorage(LocalStorageKey.PdfSidebarOpen, !mdAndDown.value, { writeDefaults: false });
const isWatermarkOpen = ref(false);
const isUnavailable = computed(() => isFailed || isViewerFailed.value);
// The pages' area waits on the viewer's module and on the document, and a failure says so in place of a spinner. A
// Password request holds the document back on purpose, so the prompt stands in for the spinner until it is answered
const isLoading = computed(() => !isUnavailable.value && !isPasswordRequested && (!viewerApi.value || !pdfDocument));
const submitPassword = () => {
  emit("submitPassword", passwordInput.value);
};
// A page chosen from the sidebar is shown across the whole width of a phone, so the overlay that held the choice closes
const closeSidebarOnPhone = () => {
  if (mdAndDown.value) isSidebarOpen.value = false;
};
</script>

<template>
  <div bg-background flex flex-col gap-2 min-h-0>
    <PdfViewerToolbar
      v-model:is-sidebar-open="isSidebarOpen"
      :filename
      :viewer="state"
      @watermark="isWatermarkOpen = true"
    />
    <PdfViewerSearchBar :viewer="state" />
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
    <p v-if="isUnavailable" text-muted p-3>The PDF could not be loaded.</p>
    <div flex flex-1 min-h-0 relative>
      <PdfViewerSidebar
        v-if="isSidebarOpen && !isUnavailable"
        :pdf-document
        :viewer="state"
        @chose-page="() => closeSidebarOnPhone()"
      />
      <div ref="container" flex-1 min-h-0 min-w-0 of-auto>
        <div ref="viewer" class="pdfViewer" />
      </div>
      <div v-if="isLoading" flex items-center inset-0 justify-center absolute>
        <UiSpinner />
      </div>
    </div>
    <PdfViewerWatermarkDialog v-model="isWatermarkOpen" :filename :viewer="state" />
  </div>
</template>
