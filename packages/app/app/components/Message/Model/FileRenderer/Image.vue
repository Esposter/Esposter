<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
// Show the lightweight thumbnail inline when one exists — the lightbox still opens the full-resolution original.
const thumbnailUrl = useReadThumbnailUrl(
  () => file,
  () => isPreview,
);
// Thumbnail SAS urls are minted from the mimetype alone, so the blob can be missing (pre-feature uploads,
// Failed client-side generation) — fall back to the original on load error.
const failedThumbnailUrl = ref("");
</script>

<template>
  <v-img
    :src="thumbnailUrl && thumbnailUrl !== failedThumbnailUrl ? thumbnailUrl : url"
    :alt="file.filename"
    :cover="isPreview"
    :class="isPreview ? 'size-full' : undefined"
    @error="failedThumbnailUrl = thumbnailUrl"
  />
</template>
