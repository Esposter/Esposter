<script setup lang="ts">
import { downloadUrl } from "@/services/app/downloadUrl";
import { getInferredMimetype } from "@/services/file/getInferredMimetype";
import { MAX_ZOOM_SCALE, MIN_ZOOM_SCALE, ZOOM_SCALE_PER_WHEEL_STEP } from "@/services/message/file/constants";
import { useFileStore } from "@/store/message/file";
import { useFileDialogStore } from "@/store/message/file/dialog";

const fileStore = useFileStore();
const { fileUrlMap, viewableFiles } = storeToRefs(fileStore);
const fileDialogStore = useFileDialogStore();
const { viewingFileId } = storeToRefs(fileDialogStore);
const { isOpen, item: file } = useSingletonDialog(viewingFileId, () =>
  viewableFiles.value.find(({ id }) => id === viewingFileId.value),
);
const image = useTemplateRef("image");
// Cursor is inherited from the frame rather than set here, so the zoom-in/grab affordance stays a binding on an
// Element panzoom does not also write styles to
const { isZoomed, panzoom } = usePanZoom(image, {
  cursor: "inherit",
  maxScale: MAX_ZOOM_SCALE,
  minScale: MIN_ZOOM_SCALE,
  panOnlyWhenZoomed: true,
  step: ZOOM_SCALE_PER_WHEEL_STEP,
});
const index = computed(() => viewableFiles.value.findIndex(({ id }) => id === viewingFileId.value));
// Read by id rather than captured when the viewer opened, so the store's refresh sweep re-minting an expiring
// Read SAS reaches a viewer that is still on screen
const url = computed(() => (file.value ? (fileUrlMap.value.get(file.value.id)?.url ?? "") : ""));
const isVideo = computed(() => (file.value ? getInferredMimetype(file.value.mimetype) === "video" : false));
const view = (offset: number) => {
  const nextFile = viewableFiles.value[index.value + offset];
  if (nextFile) viewingFileId.value = nextFile.id;
};
// Panzoom claims the wheel itself, so the guard is what leaves a video's own wheel behaviour alone
const zoom = (event: WheelEvent) => {
  if (!panzoom.value) return;
  const { scale } = panzoom.value.zoomWithWheel(event);
  // Back at the fitted size there is nothing outside the frame to pan into, so an offset dragged in while zoomed
  // Would otherwise strand the image off-centre with no way to bring it back
  if (scale === MIN_ZOOM_SCALE) panzoom.value.pan(0, 0, { force: true });
};

watch(viewingFileId, () => {
  panzoom.value?.reset();
});
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
    <div
      flex
      items-center
      justify-center
      overflow-hidden
      :class="isZoomed ? 'cursor-grab' : 'cursor-zoom-in'"
      @wheel="zoom"
    >
      <video v-if="isVideo" max-h="[80vh]" controls autoplay max-w-full cursor-default :src="url" />
      <div v-else ref="image">
        <NuxtImg max-h="[80vh]" max-w-full :src="url" :alt="file.filename" />
      </div>
    </div>
  </StyledDialog>
</template>
