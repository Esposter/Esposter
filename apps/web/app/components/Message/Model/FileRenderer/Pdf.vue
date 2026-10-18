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
    :is-failed="isFailed || isRendererFailed"
    :pdf-document="pdfDocument"
    @click="
      () => {
        if (!isPreview) isOpen = true;
      }
    "
  />
  <StyledDialog v-if="!isPreview" v-model="isOpen" :title="file.filename" w="[min(64rem,96vw)]">
    <PdfViewer
      h="[64dvh]"
      :key="url"
      :filename="file.filename"
      :is-failed="isFailed || isRendererFailed"
      :is-password-requested="isPasswordRequested"
      :is-password-wrong="isPasswordWrong"
      :pdf-document="pdfDocument"
      :renderer
      @submit-password="(password) => submitPassword(password)"
    />
  </StyledDialog>
</template>
