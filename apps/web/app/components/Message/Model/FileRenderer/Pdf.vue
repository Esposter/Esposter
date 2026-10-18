<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

import { PREVIEW_MAX_HEIGHT } from "@/services/message/file/constants";

const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
const isOpen = ref(false);
</script>

<template>
  <PdfThumbnail
    :style="isPreview ? { maxHeight: PREVIEW_MAX_HEIGHT } : { cursor: 'pointer' }"
    :url
    @click="
      () => {
        if (!isPreview) isOpen = true;
      }
    "
  />
  <StyledDialog v-if="!isPreview" v-model="isOpen" :title="file.filename" w="[min(64rem,96vw)]">
    <PdfViewer h="[64dvh]" :filename="file.filename" :key="url" :url />
  </StyledDialog>
</template>
