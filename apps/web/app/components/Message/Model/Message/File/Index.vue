<script setup lang="ts">
import type { FileEntity, MessageEntity } from "@esposter/db-schema";

import { getFileCornerStyle } from "@/services/message/file/getFileCornerStyle";
import { useDataStore } from "@/store/message/data";
import { useFileStore } from "@/store/message/file";
import { useFileDialogStore } from "@/store/message/file/dialog";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface Props {
  columnLayout: number[];
  file: FileEntity;
  index: number;
  isPreview?: boolean;
  message: MessageEntity;
}

const { columnLayout, file, index, isPreview, message } = defineProps<Props>();
const isCreator = await useIsCreator(() => message);
const dataStore = useDataStore();
const { deleteFile } = dataStore;
const fileStore = useFileStore();
const { getFileUrlMap, getViewableFiles } = fileStore;
const fileDialogStore = useFileDialogStore();
const { viewingFileId, viewingRoomId } = storeToRefs(fileDialogStore);
// The message's own room, never the one on screen: the thread pane renders a message beside whatever room is open
const fileUrl = computed(() => getFileUrlMap(message.partitionKey)?.get(file.id));
const url = computed(() => fileUrl.value?.url ?? "");
const isViewable = computed(() => getViewableFiles(message.partitionKey).some(({ id }) => id === file.id));
const cornerStyle = computed(() => getFileCornerStyle(columnLayout, index));
const isActive = ref(false);
const view = () => {
  if (!isViewable.value) return;
  viewingRoomId.value = message.partitionKey;
  viewingFileId.value = file.id;
};
</script>

<template>
  <!-- A picture or a video opens in the viewer, so the tile is pressed as a whole; any other file is read in place -->
  <div
    :style="cornerStyle"
    :role="isViewable ? 'button' : undefined"
    :tabindex="isViewable ? 0 : undefined"
    :aria-label="isViewable ? `View ${file.filename}` : undefined"
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
      @delete="deleteFile({ id: file.id, partitionKey: message.partitionKey, rowKey: message.rowKey })"
    />
  </div>
</template>
