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
// Failed client-side generation) — fall back to the original on load error. Remembered as a flag about THIS
// File's thumbnail, not as the url that failed: the store re-mints every cached read url on an interval, so a
// Url-keyed memory stops matching the moment it does, and each re-mint sends the image back to a blob already
// Known to be missing — blanking to the placeholder, 404ing, and falling back again on every refresh
const isThumbnailFailed = ref(false);
// Which url is actually on screen, so a load error is only blamed on the thumbnail when the thumbnail is what
// Failed: the original renders whenever no thumbnail url is held yet (before the batched read lands) or after
// A read SAS expired, and latching on that error would suppress the thumbnail for the component's whole life —
// Every image in the message then re-downloading the full-resolution original on each hourly re-mint
const isThumbnailRendered = computed(() => Boolean(thumbnailUrl.value) && !isThumbnailFailed.value);
</script>

<template>
  <v-img
    :src="isThumbnailRendered ? thumbnailUrl : url"
    :alt="file.filename"
    :cover="isPreview"
    :class="isPreview ? 'size-full' : undefined"
    @error="isThumbnailFailed ||= isThumbnailRendered"
  />
</template>
