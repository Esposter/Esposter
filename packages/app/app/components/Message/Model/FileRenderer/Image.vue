<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

import { useDownloadFileStore } from "@/store/message/file";

const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
const downloadFileStore = useDownloadFileStore();
const { fileUrlMap } = storeToRefs(downloadFileStore);
// Show the lightweight thumbnail inline when one exists — the lightbox still opens the full-resolution original.
// It rides the same batched read as the original url, so a rendered list costs no extra query per image.
const thumbnailUrl = computed(() =>
  isPreview || !file.hasThumbnail ? "" : (fileUrlMap.value.get(file.id)?.thumbnailUrl ?? ""),
);
// Whether the thumbnail blob exists is recorded on the file by the upload that wrote it (`hasThumbnail`), so
// A load error here can only ever mean this url went stale — the read SAS expired ahead of the store's sweep.
// Remembering which url failed is therefore enough and terminates on its own: the sweep re-mints, the new url
// Is not in the set, and the thumbnail comes back. A flag latched on the error instead never recovers, and
// Downgrades every image in the room to its full-resolution original for the component's whole lifetime
const failedThumbnailUrls = ref(new Set<string>());
// Which url is actually on screen, so a load error is only blamed on the thumbnail when the thumbnail is what
// Failed: the original renders whenever no thumbnail url is held yet (before the batched read lands)
const isThumbnailRendered = computed(
  () => Boolean(thumbnailUrl.value) && !failedThumbnailUrls.value.has(thumbnailUrl.value),
);
</script>

<template>
  <NuxtImg
    max-w-full
    :src="isThumbnailRendered ? thumbnailUrl : url"
    :alt="file.filename"
    :class="isPreview ? 'size-full object-cover' : undefined"
    @error="
      () => {
        if (isThumbnailRendered) failedThumbnailUrls.add(thumbnailUrl);
      }
    "
  />
</template>
