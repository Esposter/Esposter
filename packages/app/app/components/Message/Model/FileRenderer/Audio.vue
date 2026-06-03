<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

const { isPreview, url } = defineProps<FileRendererComponentProps>();
</script>

<template>
  <StyledCard p-2 flex items-center justify-center :class="isPreview ? 'size-full' : undefined">
    <audio :src="url" controls w-full />
  </StyledCard>
</template>
