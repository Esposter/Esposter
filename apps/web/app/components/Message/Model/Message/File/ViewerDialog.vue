<script setup lang="ts">
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { downloadUrl } from "@/services/app/downloadUrl";
import { MAX_ZOOM_SCALE, MIN_ZOOM_SCALE, ZOOM_SCALE_PER_WHEEL_STEP } from "@/services/message/file/constants";
import { useFileStore } from "@/store/message/file";
import { useFileDialogStore } from "@/store/message/file/dialog";
import { getMimeCategory, MimeCategory } from "@esposter/db-schema";

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
// The set's ends are ends, so the arrows walk it rather than wrap it. Registered only while the viewer is open, so a
// Keystroke never pages through a gallery nobody is looking at and the shortcuts dialog lists them only then
useCommands(() =>
  isOpen.value
    ? [
        {
          group: "Attachments",
          id: "previous-attachment",
          meaning: UiIconMeaning.Previous,
          run: () => {
            view(-1);
          },
          shortcut: "arrowleft",
          title: "Previous attachment",
        },
        {
          group: "Attachments",
          id: "next-attachment",
          meaning: UiIconMeaning.Next,
          run: () => {
            view(1);
          },
          shortcut: "arrowright",
          title: "Next attachment",
        },
      ]
    : [],
);
</script>

<template>
  <!-- A picture looked at on its own, in the middle of the screen, with the way through the rest of the message's set
    Under it. Its buttons sit by the picture, so they take the raised default rather than the quiet look -->
  <UiDialog v-if="file" v-model="isOpen" :placement="UiDialogPlacement.Middle" :title="file.filename" max-w="[90vw]">
    <div
      :class="isZoomed ? 'cursor-grab' : 'cursor-zoom-in'"
      p-3
      flex
      flex-1
      min-h-0
      items-center
      justify-center
      of-hidden
      @wheel="zoom"
    >
      <video
        v-if="getMimeCategory(file.mimetype) === MimeCategory.Video"
        max-h="[64dvh]"
        controls
        autoplay
        max-w-full
        cursor-default
        :src="url"
      />
      <div v-else ref="image">
        <NuxtImg max-h="[64dvh]" max-w-full :src="url" :alt="file.filename" />
      </div>
    </div>
    <footer p-3 flex gap-2 items-center>
      <span text-sm text-muted flex-1>{{ index + 1 }} of {{ viewableFiles.length }}</span>
      <UiIconButton label="Previous" :meaning="UiIconMeaning.Previous" :disabled="index === 0" @click="view(-1)" />
      <UiIconButton
        label="Next"
        :meaning="UiIconMeaning.Next"
        :disabled="index === viewableFiles.length - 1"
        @click="view(1)"
      />
      <UiIconButton label="Download" :meaning="UiIconMeaning.Download" @click="downloadUrl(url, file.filename)" />
    </footer>
  </UiDialog>
</template>
