<script setup lang="ts">
import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { authClient } from "@/services/auth/authClient";
import { CONTAINER_BORDER_RADIUS } from "@/services/esbabbler/file/constants";
import { useMessageStore } from "@/store/esbabbler/message";
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
const messageStore = useMessageStore();
const { downloadFileUrlMap } = storeToRefs(messageStore);
const url = computed(() => downloadFileUrlMap.value.get(file.id)?.url ?? "");
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
    @mouseenter="isActive = true"
    @mouseleave="isActive = false"
  >
    <EsbabblerFileRenderer :file :url />
    <div
      v-if="!isPreview && isCreator && (columnLayout.length > 1 || !EMPTY_TEXT_REGEX.test(message.message))"
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
