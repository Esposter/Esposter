<script setup lang="ts">
import { useZoomPan } from "@/composables/message/file/useZoomPan";
import { downloadUrl } from "@/services/app/downloadUrl";
import { getInferredMimetype } from "@/services/file/getInferredMimetype";
import { useDownloadFileStore } from "@/store/message/file";
import { useFileDialogStore } from "@/store/message/file/dialog";

const downloadFileStore = useDownloadFileStore();
const { fileUrlMap, viewableFiles } = storeToRefs(downloadFileStore);
const fileDialogStore = useFileDialogStore();
const { viewingFileId } = storeToRefs(fileDialogStore);
const { isOpen, item: file } = useSingletonDialog(viewingFileId, () =>
  viewableFiles.value.find(({ id }) => id === viewingFileId.value),
);
const { endPan, isZoomed, pan, reset, startPan, transform, zoom } = useZoomPan();
const index = computed(() => viewableFiles.value.findIndex(({ id }) => id === viewingFileId.value));
// Read by id rather than captured when the viewer opened, so the store's refresh sweep re-minting an expiring
// Read SAS reaches a viewer that is still on screen
const url = computed(() => (file.value ? (fileUrlMap.value.get(file.value.id)?.url ?? "") : ""));
const isVideo = computed(() => (file.value ? getInferredMimetype(file.value.mimetype) === "video" : false));
const view = (offset: number) => {
  const nextFile = viewableFiles.value[index.value + offset];
  if (nextFile) viewingFileId.value = nextFile.id;
};

watch(viewingFileId, reset);
// The set's ends are ends, so the arrows walk it rather than wrap it — and a keystroke reaching a closed viewer
// Would otherwise page through a gallery nobody is looking at
onKeyStroke(["ArrowLeft", "ArrowRight"], (event) => {
  if (!isOpen.value) return;
  view(event.key === "ArrowLeft" ? -1 : 1);
});
</script>

<template>
  <StyledDialog
    v-if="file"
    v-model="isOpen"
    :card-props="{ subtitle: `${index + 1} of ${viewableFiles.length}`, title: file.filename }"
    :dialog-props="{ width: 'auto' }"
  >
    <template #prepend-actions>
      <StyledTooltipIconButton
        :button-props="{ disabled: index === 0, variant: 'plain' }"
        icon="mdi-chevron-left"
        text="Previous"
        @click="view(-1)"
      />
      <StyledTooltipIconButton
        :button-props="{ disabled: index === viewableFiles.length - 1, variant: 'plain' }"
        icon="mdi-chevron-right"
        text="Next"
        @click="view(1)"
      />
      <StyledTooltipIconButton
        :button-props="{ variant: 'plain' }"
        icon="mdi-download"
        text="Download"
        @click="downloadUrl(url, file.filename)"
      />
    </template>
    <div flex items-center justify-center overflow-hidden>
      <video v-if="isVideo" class="max-h-[80vh]" controls autoplay max-w-full :src="url" />
      <NuxtImg
        v-else
        class="max-h-[80vh]"
        max-w-full
        :style="{ cursor: isZoomed ? 'grab' : 'zoom-in', transform }"
        :src="url"
        :alt="file.filename"
        @pointerdown="startPan"
        @pointermove="pan"
        @pointerup="endPan"
        @pointerleave="endPan"
        @wheel.prevent="zoom"
      />
    </div>
  </StyledDialog>
</template>
