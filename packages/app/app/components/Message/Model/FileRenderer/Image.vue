<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
// Show the lightweight thumbnail inline when one exists — the lightbox still opens the full-resolution original.
const thumbnailUrl = useReadThumbnailUrl(
  () => file,
  () => isPreview,
);
</script>

<template>
  <v-img
    :src="thumbnailUrl || url"
    :alt="file.filename"
    :cover="isPreview"
    :class="isPreview ? 'size-full' : undefined"
  />
</template>
