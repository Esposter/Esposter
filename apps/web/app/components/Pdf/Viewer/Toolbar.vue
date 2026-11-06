<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { PdfAnnotationsState, PdfViewerState } from "vue-pdfjs-headless";

import { MimeType } from "#shared/models/file/MimeType";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { importFile } from "@/services/file/importFile";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useAlertStore } from "@/store/alert";
import { trimFileExtension } from "@/util/file/trimFileExtension";
import { downloadFile, getResultAsync, noop } from "@esposter/shared";
import { PDF_ROTATION_STEP, PdfEditorMode } from "vue-pdfjs-headless";

interface Props {
  annotations: PdfAnnotationsState;
  filename: string;
  viewer: PdfViewerState;
}

const isSidebarOpen = defineModel<boolean>("isSidebarOpen", { required: true });
const { annotations, filename, viewer } = defineProps<Props>();
const emit = defineEmits<{ watermark: [] }>();
const {
  currentPageNumber,
  editorMode,
  isMatchCase,
  isWholeWord,
  isZoomInDisabled,
  isZoomOutDisabled,
  pagesCount,
  scale,
} = viewer;
const alertStore = useAlertStore();
const { createAlert } = alertStore;
// Every control that acts on the document is unavailable until one is open, as the bar draws it
const isDisabled = computed(() => pagesCount.value === 0);
// The page field shows the page the reader is on, and holds what is typed until Enter goes to it
const { cloned: pageInput } = useCloned(() => (currentPageNumber.value ? String(currentPageNumber.value) : ""));
// The readout is the reset as well as the scale, and reads nothing before a document sets one
const zoomPercent = computed(() => (scale.value ? `${Math.round(scale.value * 100)}%` : ""));
// The file's text is imported. A refusal alerts the reader with the file's name and the reason it was refused, and a file
// That cannot be read is a failure the error alert names
const importAnnotations = async (file: File) => {
  await getResultAsync(() => file.text()).match(
    (xfdf) =>
      annotations.importXfdf(xfdf).match(noop, (message) => {
        createAlert(`${file.name}: ${message}`, "error");
      }),
    (error) => {
      createErrorAlert(error);
    },
  );
};
// The occasional commands, in the groups the menu shows them: the search's settings, the pages' view, the annotations
// And the file
const items = computed<Item[]>(() => [
  {
    isChecked: isMatchCase.value,
    meaning: UiIconMeaning.MatchCase,
    onClick: () => {
      isMatchCase.value = !isMatchCase.value;
    },
    title: "Match case",
  },
  {
    isChecked: isWholeWord.value,
    meaning: UiIconMeaning.WholeWord,
    onClick: () => {
      isWholeWord.value = !isWholeWord.value;
    },
    title: "Whole word",
  },
  {
    disabled: isDisabled.value,
    isGroupStart: true,
    meaning: UiIconMeaning.RotateLeft,
    onClick: () => {
      viewer.rotate(-PDF_ROTATION_STEP);
    },
    title: "Rotate left",
  },
  {
    disabled: isDisabled.value,
    meaning: UiIconMeaning.RotateRight,
    onClick: () => {
      viewer.rotate(PDF_ROTATION_STEP);
    },
    title: "Rotate right",
  },
  {
    disabled: isDisabled.value,
    meaning: UiIconMeaning.FitPage,
    onClick: () => {
      viewer.fitPage();
    },
    title: "Fit page",
  },
  {
    disabled: isDisabled.value,
    meaning: UiIconMeaning.ActualSize,
    onClick: () => {
      viewer.actualSize();
    },
    title: "Actual size",
  },
  {
    disabled: isDisabled.value,
    isChecked: editorMode.value === PdfEditorMode.FreeText,
    isGroupStart: true,
    meaning: UiIconMeaning.Edit,
    onClick: () => {
      annotations.setEditorMode(
        editorMode.value === PdfEditorMode.FreeText ? PdfEditorMode.None : PdfEditorMode.FreeText,
      );
    },
    title: "Add text",
  },
  {
    disabled: isDisabled.value,
    meaning: UiIconMeaning.Upload,
    onClick: async () => {
      await importFile(MimeType.Xfdf, ".xfdf", importAnnotations);
    },
    title: "Import annotations",
  },
  {
    disabled: isDisabled.value,
    meaning: UiIconMeaning.Download,
    onClick: () => {
      downloadFile(`${trimFileExtension(filename)}.xfdf`, annotations.exportXfdf(), MimeType.Xfdf);
    },
    title: "Export annotations",
  },
  {
    disabled: isDisabled.value,
    isGroupStart: true,
    meaning: UiIconMeaning.Print,
    onClick: () => {
      viewer.print();
    },
    title: "Print",
  },
  {
    disabled: isDisabled.value,
    meaning: UiIconMeaning.Download,
    onClick: () => {
      viewer.download(filename);
    },
    title: "Download",
  },
  {
    disabled: isDisabled.value,
    meaning: UiIconMeaning.Watermark,
    onClick: () => {
      emit("watermark");
    },
    title: "Download with watermark",
  },
]);
</script>

<template>
  <div role="toolbar" aria-label="PDF tools" flex gap-1 items-center justify-between>
    <div flex gap-1 items-center>
      <UiIconButton
        label="Sidebar"
        :aria-pressed="isSidebarOpen"
        :meaning="UiIconMeaning.Sidebar"
        :variant="UiButtonVariant.Quiet"
        @click="isSidebarOpen = !isSidebarOpen"
      />
      <UiForm flex gap-1 items-center @submit="() => viewer.goToPage(Number(pageInput))">
        <UiIconButton
          label="Previous page"
          :disabled="isDisabled"
          :meaning="UiIconMeaning.Previous"
          :variant="UiButtonVariant.Quiet"
          @click="() => viewer.previousPage()"
        />
        <UiTextField
          v-model="pageInput"
          label="Page"
          is-label-hidden
          :is-disabled="isDisabled || undefined"
          :type="UiTextFieldType.Number"
          w-14
        />
        <span class="hidden sm:inline" text-sm>of {{ pagesCount }}</span>
        <UiIconButton
          label="Next page"
          :disabled="isDisabled"
          :meaning="UiIconMeaning.Next"
          :variant="UiButtonVariant.Quiet"
          @click="() => viewer.nextPage()"
        />
      </UiForm>
    </div>
    <div flex gap-1 items-center>
      <UiIconButton
        label="Zoom out"
        :disabled="isDisabled || isZoomOutDisabled"
        :meaning="UiIconMeaning.ZoomOut"
        :variant="UiButtonVariant.Quiet"
        @click="() => viewer.zoomOut()"
      />
      <UiButton
        :aria-label="zoomPercent ? `Zoom ${zoomPercent}, reset` : 'Reset zoom'"
        :disabled="isDisabled"
        :variant="UiButtonVariant.Quiet"
        @click="() => viewer.resetZoom()"
      >
        {{ zoomPercent }}
      </UiButton>
      <UiIconButton
        label="Zoom in"
        :disabled="isDisabled || isZoomInDisabled"
        :meaning="UiIconMeaning.ZoomIn"
        :variant="UiButtonVariant.Quiet"
        @click="() => viewer.zoomIn()"
      />
    </div>
    <UiOverflowMenu :items label="PDF actions" />
  </div>
</template>
