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
const { fileUrlMap, viewableFiles } = storeToRefs(fileStore);
const fileDialogStore = useFileDialogStore();
const { viewingFileId } = storeToRefs(fileDialogStore);
const url = computed(() => fileUrlMap.value.get(file.id)?.url ?? "");
const isViewable = computed(() => viewableFiles.value.some(({ id }) => id === file.id));
const cornerStyle = computed(() => getFileCornerStyle(columnLayout, index));
const isActive = ref(false);
</script>

<template>
  <StyledCard
    :style="cornerStyle"
    h-full
    @="isViewable ? { click: () => (viewingFileId = file.id) } : {}"
    @mouseenter="isActive = true"
    @mouseleave="isActive = false"
  >
    <MessageModelFileRenderer :file :is-preview :url />
    <!-- Mounting on hover keeps the options menu tree off the tree for the whole file grid -->
    <div
      v-if="
        isActive &&
        !message.isForward &&
        isCreator &&
        (columnLayout.length > 1 || !EMPTY_TEXT_REGEX.test(message.message))
      "
      right-2
      top-2
      absolute
    >
      <v-hover #default="{ isHovering, props: hoverProps }">
        <MessageModelMessageFileOptionsMenu
          :filename="file.filename"
          :is-hovering
          :hover-props
          :url
          @delete="deleteFile({ id: file.id, partitionKey: message.partitionKey, rowKey: message.rowKey })"
        />
      </v-hover>
    </div>
  </StyledCard>
</template>
