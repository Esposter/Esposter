<script setup lang="ts">
import type { FileEntity, MessageEntity } from "@esposter/db-schema";

import { getFileCornerStyle } from "@/services/message/file/getFileCornerStyle";
import { useDataStore } from "@/store/message/data";
import { useDownloadFileStore } from "@/store/message/file";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface FileProps {
  columnLayout: number[];
  file: FileEntity;
  index: number;
  isPreview?: boolean;
  message: MessageEntity;
}

const { columnLayout, file, index, isPreview, message } = defineProps<FileProps>();
const isCreator = await useIsCreator(() => message);
const dataStore = useDataStore();
const { deleteFile } = dataStore;
const downloadFileStore = useDownloadFileStore();
const { viewFiles } = downloadFileStore;
const { fileUrlMap, viewableFiles } = storeToRefs(downloadFileStore);
const url = computed(() => fileUrlMap.value.get(file.id)?.url ?? "");
const viewableFileIndex = computed(() => viewableFiles.value.findIndex(({ id }) => id === file.id));
const isActive = ref(false);
</script>

<template>
  <StyledCard
    :style="getFileCornerStyle(columnLayout, index)"
    h-full
    @="viewableFileIndex === -1 ? {} : { click: () => viewFiles(viewableFileIndex) }"
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
