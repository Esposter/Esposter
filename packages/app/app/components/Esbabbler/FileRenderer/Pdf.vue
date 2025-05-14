<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

import { VPdfViewer } from "@vue-pdf-viewer/viewer";
import VuePdfEmbed from "vue-pdf-embed";
import "vue-pdf-embed/dist/styles/annotationLayer.css";
import "vue-pdf-embed/dist/styles/textLayer.css";

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
    :style="{
      maxHeight: isPreview ? '8rem' : undefined,
      cursor: isPreview ? undefined : 'pointer',
    }"
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
      <VPdfViewer v-model:dark-mode="darkMode" :download-filename="file.filename" :src="url" />
    </StyledCard>
  </v-dialog>
</template>
