<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

import { getFileSize } from "@/services/file/getFileSize";

const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
const fileSize = computed(() => getFileSize(file.size));
</script>

<template>
  <NuxtInvisibleLink :to="url">
    <StyledCard p-2 flex flex-col size-full items-center justify-center>
      <v-icon icon="mdi-file" :size="isPreview ? '6rem' : 'large'" />
      <span>{{ file.filename }}{{ isPreview ? "" : ` (${fileSize})` }}</span>
    </StyledCard>
  </NuxtInvisibleLink>
</template>
