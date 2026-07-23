<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

import { useDownloadFileStore } from "@/store/message/file";

const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
const downloadFileStore = useDownloadFileStore();
const { fileUrlMap } = storeToRefs(downloadFileStore);
// Show the lightweight thumbnail inline when one exists — the lightbox still opens the full-resolution original.
// It rides the same batched read as the original url, so a rendered list costs no extra query per image.
const thumbnailUrl = computed(() => (isPreview ? "" : (fileUrlMap.value.get(file.id)?.thumbnailUrl ?? "")));
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
