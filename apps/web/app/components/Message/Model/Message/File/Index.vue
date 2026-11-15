<script setup lang="ts">
import type { ClientMessage } from "@/models/message/ClientMessage";
import type { FileEntity } from "@esposter/db-schema";

import { getFileCornerStyle } from "@/services/message/file/getFileCornerStyle";
import { useFileStore } from "@/store/message/file";
import { useFileDialogStore } from "@/store/message/file/dialog";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface Props {
  columnLayout: number[];
  file: FileEntity;
  index: number;
  isPreview?: boolean;
  message: ClientMessage;
}

const { columnLayout, file, index, message } = defineProps<Props>();
const isCreator = await useIsCreator(() => message);
const fileStore = useFileStore();
const { getFileUrlMap, getViewableFiles } = fileStore;
const fileDialogStore = useFileDialogStore();
const { deletingFileId, deletingMessageId, deletingRoomId, viewingFileId, viewingRoomId } =
  storeToRefs(fileDialogStore);
// The message's own room, never the one on screen: the thread pane renders a message beside whatever room is open
const fileUrl = computed(() => getFileUrlMap(message.roomId)?.get(file.id));
const url = computed(() => fileUrl.value?.url ?? "");
const isViewable = computed(() => getViewableFiles(message.roomId).some(({ id }) => id === file.id));
const cornerStyle = computed(() => getFileCornerStyle(columnLayout, index));
const isActive = ref(false);
const isSpoilerRevealed = ref(false);
const ariaLabel = computed(() => {
  if (!isViewable.value) return undefined;
  return file.isSpoiler && !isSpoilerRevealed.value ? `Reveal spoiler: ${file.filename}` : `View ${file.filename}`;
});
const view = () => {
  if (!isViewable.value) return;
  if (file.isSpoiler && !isSpoilerRevealed.value) {
    isSpoilerRevealed.value = true;
    return;
  }
  viewingRoomId.value = message.roomId;
  viewingFileId.value = file.id;
};
</script>

<template>
  <!-- A picture or a video opens in the viewer, so the tile is pressed as a whole; any other file is read in place -->
  <div
    :style="cornerStyle"
    :role="isViewable ? 'button' : undefined"
    :tabindex="isViewable ? 0 : undefined"
    :aria-label
    :class="{ 'cursor-zoom-in': isViewable }"
    h-full
    relative
    of-hidden
    ui-field
    @click="view()"
    @keydown.enter.self.prevent="view()"
    @keydown.space.self.prevent="view()"
    @mouseenter="isActive = true"
    @mouseleave="isActive = false"
    @focusin="isActive = true"
    @focusout="isActive = false"
  >
    <MessageModelFileRenderer :file :is-preview :thumbnail-url="fileUrl?.thumbnailUrl" :url />
    <div
      v-if="file.isSpoiler && !isSpoilerRevealed && isViewable"
      text-white
      bg="black/60"
      flex
      pointer-events-none
      items-center
      inset-0
      justify-center
      absolute
      backdrop-blur-md
    >
      SPOILER
    </div>
    <!-- Mounting on hover keeps the options tree off the tree for the whole file grid -->
    <MessageModelMessageFileOptionsMenu
      v-if="
        isActive &&
        !message.isForward &&
        isCreator &&
        (columnLayout.length > 1 || !EMPTY_TEXT_REGEX.test(message.message))
      "
      right-2
      top-2
      absolute
      :filename="file.filename"
      :url
      @delete="
        () => {
          deletingRoomId = message.roomId;
          deletingMessageId = message.id;
          deletingFileId = file.id;
        }
      "
    />
  </div>
</template>
