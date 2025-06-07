<script setup lang="ts">
import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { authClient } from "@/services/auth/authClient";
import { CONTAINER_BORDER_RADIUS } from "@/services/esbabbler/file/constants";
import { useDownloadFileStore } from "@/store/esbabbler/downloadFile";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface FileProps {
  columnLayout: number[];
  file: FileEntity;
  index: number;
  isPreview?: boolean;
  message: MessageEntity;
}

const { columnLayout, file, index, isPreview = false, message } = defineProps<FileProps>();
const { data: session } = await authClient.useSession(useFetch);
const isCreator = computed(() => session.value?.user.id === message.userId);
const { $trpc } = useNuxtApp();
const downloadFileStore = useDownloadFileStore();
const { viewFiles } = downloadFileStore;
const { fileUrlMap, viewableFiles } = storeToRefs(downloadFileStore);
const url = computed(() => fileUrlMap.value.get(file.id)?.url ?? "");
const viewableFileIndex = computed(() => viewableFiles.value.findIndex(({ id }) => id === file.id));
const isActive = ref(false);
</script>

<template>
  <StyledCard
    :style="{
      borderTopLeftRadius: index === 0 ? CONTAINER_BORDER_RADIUS : undefined,
      borderTopRightRadius: index === 12 / columnLayout[0] - 1 ? CONTAINER_BORDER_RADIUS : undefined,
      borderBottomLeftRadius:
        index === columnLayout.length - 1 - (12 / columnLayout[columnLayout.length - 1] - 1)
          ? CONTAINER_BORDER_RADIUS
          : undefined,
      borderBottomRightRadius: index === columnLayout.length - 1 ? CONTAINER_BORDER_RADIUS : undefined,
    }"
    h-full
    @="viewableFileIndex === -1 ? {} : { click: () => viewFiles(viewableFileIndex) }"
    @mouseenter="isActive = true"
    @mouseleave="isActive = false"
  >
    <EsbabblerFileRenderer :file :is-preview :url />
    <div
      v-if="!message.isForward && isCreator && (columnLayout.length > 1 || !EMPTY_TEXT_REGEX.test(message.message))"
      v-show="isActive"
      absolute
      top-2
      right-2
    >
      <v-hover #default="{ isHovering, props: hoverProps }">
        <EsbabblerModelMessageFileOptionsMenu
          :is-hovering
          :hover-props
          @delete="
            $trpc.message.deleteFile.mutate({ partitionKey: message.partitionKey, rowKey: message.rowKey, id: file.id })
          "
        />
      </v-hover>
    </div>
  </StyledCard>
</template>
