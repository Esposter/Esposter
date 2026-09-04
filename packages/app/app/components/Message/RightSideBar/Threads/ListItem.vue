<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useThreadStore } from "@/store/message/thread";

interface MessageRightSideBarThreadsListItemProps {
  thread: MessageEntity;
}

const { thread } = defineProps<MessageRightSideBarThreadsListItemProps>();
const creator = useCreator(() => thread);
const threadStore = useThreadStore();
const { openThread } = threadStore;
</script>

<template>
  <component
    :is="MessageComponentMap[thread.type]"
    v-if="creator"
    :creator
    :message="thread"
    is-preview
    @click="openThread(thread.partitionKey, thread.rowKey)"
  />
</template>
