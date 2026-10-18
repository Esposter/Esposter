<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";
import type { PdfRenderer } from "vue-pdfjs-headless";

import { PREVIEW_MAX_HEIGHT } from "@/services/message/file/constants";
import { loadPdfRenderer } from "@/services/pdf/loadPdfRenderer";
import { getResultAsync } from "@esposter/shared";
import { usePdfDocument } from "vue-pdfjs-headless";

const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
const isOpen = ref(false);
const renderer = shallowRef<PdfRenderer>();
const isRendererFailed = ref(false);
const { isFailed, isPasswordRequested, isPasswordWrong, pdfDocument, submitPassword } = usePdfDocument({
  renderer,
  source: () => url,
});
const isAnyFailed = computed(() => isFailed.value || isRendererFailed.value);

onMounted(async () => {
  await getResultAsync(loadPdfRenderer).match(
    (loaded) => {
      renderer.value = loaded;
    },
    (error) => {
      isRendererFailed.value = true;
      console.error(error);
    },
  );
});
</script>

<template>
  <PdfThumbnail
    :style="isPreview ? { maxHeight: PREVIEW_MAX_HEIGHT } : { cursor: 'pointer' }"
    :is-failed="isAnyFailed"
    :pdf-document
    @click="
      () => {
        if (!isPreview) isOpen = true;
      }
    "
  />
  <StyledDialog v-if="!isPreview" v-model="isOpen" :title="file.filename" w="[min(64rem,96vw)]" is-expandable>
    <!-- Its height in the middle of the screen, and all the dialog's height once the reader takes it over the page -->
    <PdfViewer
      :key="url"
      h="[64dvh]"
      grow
      :filename="file.filename"
      :is-failed="isAnyFailed"
      :is-password-requested
      :is-password-wrong
      :pdf-document
      @submit-password="(password) => submitPassword(password)"
    />
  </StyledDialog>
</template>
