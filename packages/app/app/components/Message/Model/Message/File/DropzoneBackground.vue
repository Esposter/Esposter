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
const getDropTarget = ({ target }: DragEvent): ComposerTarget =>
  activeRootRowKey.value && target instanceof Element && target.closest(`[${THREAD_COMPOSER_DROP_ZONE_ATTRIBUTE}]`)
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
  <v-dialog v-model="isOverDropZone" width="auto">
    <StyledCard p-8 text-center>
      <v-card-title font-bold pb-0 text-title-large>
        Upload to {{ dropTarget.threadRootRowKey ? "thread" : roomName }}
      </v-card-title>
      <v-card-subtitle>You can add comments before uploading.</v-card-subtitle>
    </StyledCard>
  </v-dialog>
</template>
