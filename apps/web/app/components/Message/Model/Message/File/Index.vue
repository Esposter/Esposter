<script setup lang="ts">
import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { FileEntity } from "@esposter/db-schema";

import { getFileCornerStyle } from "#src/services/message/file/getFileCornerStyle";
import { useFileDialogStore } from "#src/store/message/file/dialog";
import { useFileStore } from "#src/store/message/file/index";
import { EMPTY_TEXT_REGEX } from "#src/util/text/constants";

interface Props {
  columnLayout: number[];
  file: FileEntity;
  index: number;
  isPreview?: boolean | undefined;
  message: ClientMessage;
}

const { columnLayout, file, index, message } = defineProps<Props>();
const isCreator = await useIsCreator(() => message);
const fileStore = useFileStore();
const { checkIsViewableFile, getFileUrlMap } = fileStore;
const fileDialogStore = useFileDialogStore();
const { deletingFileId, deletingMessageId, deletingRoomId, viewingFileId, viewingRoomId } =
  storeToRefs(fileDialogStore);
// The message's own room, never the one on screen: the thread pane renders a message beside whatever room is open
const fileUrl = computed(() => getFileUrlMap(message.roomId)?.get(file.id));
const url = computed(() => fileUrl.value?.url ?? "");
const isViewable = computed(() => checkIsViewableFile(message.roomId, file));
// The options menu a creator reaches from this tile, so the tile is a stop for the keyboard while it has one
const isManageable = computed(
  () => !message.isForward && isCreator.value && (columnLayout.length > 1 || !EMPTY_TEXT_REGEX.test(message.message)),
);
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
    :tabindex="isViewable || isManageable ? 0 : undefined"
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
    <MessageModelMessageFileSpoilerOverlay
      v-if="file.isSpoiler && !isSpoilerRevealed && isViewable"
      is-heavily-blurred
    />
    <!-- Mounted on hover or focus, which keeps the options tree off the tree for the whole file grid -->
    <MessageModelMessageFileOptionsMenu
      v-if="isActive && isManageable"
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
