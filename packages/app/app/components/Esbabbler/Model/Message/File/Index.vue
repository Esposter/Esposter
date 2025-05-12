<script setup lang="ts">
import type { FileEntity } from "#shared/models/azure/FileEntity";

import { CONTAINER_BORDER_RADIUS } from "@/services/esbabbler/file/constants";
import { useMessageStore } from "@/store/esbabbler/message";

interface FileProps {
  columnLayout: number[];
  file: FileEntity;
  index: number;
  isCreator: boolean;
}

const { columnLayout, file, index, isCreator } = defineProps<FileProps>();
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
    <div v-if="isCreator" v-show="isActive" absolute top-2 right-2>
      <v-hover #default="{ isHovering, props: hoverProps }">
        <EsbabblerModelMessageFileOptionsMenu :is-hovering :hover-props />
      </v-hover>
    </div>
  </StyledCard>
</template>
