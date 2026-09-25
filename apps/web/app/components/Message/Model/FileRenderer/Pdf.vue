<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

import { PREVIEW_MAX_HEIGHT } from "@/services/message/file/constants";
import PdfWorker from "pdfjs-dist/build/pdf.worker?url";
import VuePdfEmbed from "vue-pdf-embed";
import "vue-pdf-embed/dist/styles/annotationLayer.css";
import "vue-pdf-embed/dist/styles/textLayer.css";
// The embed is the thumbnail every PDF message row renders; the full viewer only ever mounts inside the dialog
// Below, so keeping it static would make every row pay for a library nobody opened
const VPdfViewer = defineAsyncComponent(async () => (await import("@vue-pdf-viewer/viewer")).VPdfViewer);
const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
const isDark = useIsDark();
const isOpen = ref(false);
const { cloned: isDarkMode } = useCloned(isDark);
const source = computed(() => ({ url }));
</script>

<template>
  <VuePdfEmbed
    :style="isPreview ? { maxHeight: PREVIEW_MAX_HEIGHT } : { cursor: 'pointer' }"
    :page="1"
    :source
    annotation-layer
    text-layer
    @click="
      () => {
        if (!isPreview) isOpen = true;
      }
    "
  />
  <!-- @TODO: no upstream issue — the viewer portals its own menus to the body, which a dialog in the top layer
    Leaves inert, until it takes a portal target of its own. Nothing to confirm, so the shell serves it without an
    Actions row -->
  <StyledDialog v-if="!isPreview" v-model="isOpen" :title="file.filename" w="[min(64rem,96vw)]">
    <VPdfViewer
      v-model:dark-mode="isDarkMode"
      h="[64dvh]"
      :character-map="{ url: '/cmaps/' }"
      :download-filename="file.filename"
      :src="url"
      :worker-url="PdfWorker"
    />
  </StyledDialog>
</template>
