<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

import { PREVIEW_MAX_HEIGHT } from "@/services/esbabbler/file/constants";
import { VPdfViewer } from "@vue-pdf-viewer/viewer";
import PdfWorker from "pdfjs-dist/build/pdf.worker?url";
import VuePdfEmbed from "vue-pdf-embed";

const { file, isPreview, url } = defineProps<FileRendererProps>();
const isDark = useIsDark();
const dialog = ref(false);
const darkMode = ref(isDark.value);

watch(isDark, (newIsDark) => {
  darkMode.value = newIsDark;
});
</script>

<template>
  <VuePdfEmbed
    :style="isPreview ? { maxHeight: PREVIEW_MAX_HEIGHT } : { cursor: 'pointer' }"
    :page="1"
    :source="url"
    annotation-layer
    text-layer
    @="
      isPreview
        ? {}
        : {
            click: () => {
              dialog = true;
            },
          }
    "
  />
  <v-dialog v-if="!isPreview" v-model="dialog" width="64rem" height="48rem">
    <StyledCard>
      <v-card-title font-bold>{{ file.filename }}</v-card-title>
      <VPdfViewer
        v-model:dark-mode="darkMode"
        :character-map="{ url: '/cmaps/' }"
        :download-filename="file.filename"
        :src="url"
        :worker-url="PdfWorker"
      />
    </StyledCard>
  </v-dialog>
</template>

<style lang="scss">
@use "vue-pdf-embed/dist/styles/annotationLayer.css";
@use "vue-pdf-embed/dist/styles/textLayer.css";
</style>
