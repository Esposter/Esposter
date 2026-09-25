<script setup lang="ts">
import type { ComposerTarget } from "@/models/message/ComposerTarget";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { THREAD_COMPOSER_DROP_ZONE_ATTRIBUTE } from "@/services/message/composer/constants";
import { useRoomStore } from "@/store/message/room";
import { useThreadStore } from "@/store/message/thread";
import { defaultDocument } from "@vueuse/core";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roomName = useRoomName(currentRoomId);
const threadStore = useThreadStore();
const { activeRoomId, activeRootRowKey } = storeToRefs(threadStore);
// A file lands in the composer it was dropped on, so dragging one onto the open thread pane attaches it to the
// Reply rather than to the room's message. Resolved from the drop's own element: one document-level zone can
// Name every composer, where a second zone nested inside it would fire for the same drop and upload it twice
const getDropTarget = (event: DragEvent): ComposerTarget =>
  activeRootRowKey.value &&
  event.target instanceof Element &&
  event.target.closest(`[${THREAD_COMPOSER_DROP_ZONE_ATTRIBUTE}]`)
    ? { roomId: activeRoomId.value, threadRootRowKey: activeRootRowKey.value }
    : { roomId: currentRoomId.value, threadRootRowKey: "" };
const dropTarget = ref<ComposerTarget>({ roomId: "", threadRootRowKey: "" });
const uploadFiles = useUploadFiles(dropTarget);
const { isOverDropZone } = useDropZone(defaultDocument, {
  onDrop: getSynchronizedFunction(async (files: File[] | null, event: DragEvent) => {
    dropTarget.value = getDropTarget(event);
    await uploadFiles(files);
  }),
  // Tracked while dragging as well, so the overlay names where the file is about to land rather than where the
  // Last one did
  onOver: (_files, event) => {
    dropTarget.value = getDropTarget(event);
  },
});
</script>

<template>
  <!-- Says where a dragged file will land, over the whole page and out of the pointer's way, so the drop still reaches
    The composer under it and names that one -->
  <Transition name="drop">
    <div v-if="isOverDropZone" role="status" flex pointer-events-none items-center inset-0 justify-center fixed z-2000>
      <div class="scrim" inset-0 absolute />
      <div p-8 text-center flex flex-col gap-2 relative ui-lifted>
        <p ui-title>Upload to {{ dropTarget.threadRootRowKey ? "thread" : roomName }}</p>
        <p text-muted>You can add comments before uploading.</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.scrim {
  background: var(--ui-scrim);
  opacity: 0.85;
}

.drop-enter-active {
  transition: opacity var(--ui-motion-medium);
}

.drop-leave-active {
  transition: opacity var(--ui-motion-short);
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
}
</style>
