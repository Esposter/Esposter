<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

import { PREVIEW_MAX_HEIGHT } from "@/services/message/file/constants";
import { VPdfViewer } from "@vue-pdf-viewer/viewer";
import PdfWorker from "pdfjs-dist/build/pdf.worker?url";
import VuePdfEmbed from "vue-pdf-embed";
import "vue-pdf-embed/dist/styles/annotationLayer.css";
import "vue-pdf-embed/dist/styles/textLayer.css";

const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
const isDark = useIsDark();
const isOpen = ref(false);
const { cloned: isDarkMode } = useCloned(isDark);
</script>

<template>
  <VuePdfEmbed
    :style="isPreview ? { maxHeight: PREVIEW_MAX_HEIGHT } : { cursor: 'pointer' }"
    :page="1"
    :source="{ url }"
    annotation-layer
    text-layer
    @click="
      () => {
        if (!isPreview) isOpen = true;
      }
    "
  />
  <!-- Nothing to confirm, so the shell serves it without an actions row and owns the close button -->
  <StyledDialog
    v-if="!isPreview"
    v-model="isOpen"
    :card-props="{ title: file.filename }"
    :dialog-props="{ height: '48rem', width: '64rem' }"
  >
    <VPdfViewer
      v-model:dark-mode="isDarkMode"
      :character-map="{ url: '/cmaps/' }"
      :download-filename="file.filename"
      :src="url"
      :worker-url="PdfWorker"
    />
  </StyledDialog>
</template>
