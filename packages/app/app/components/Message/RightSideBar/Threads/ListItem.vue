<script setup lang="ts">
import type { StandardMessageEntity } from "@esposter/db-schema";

import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useThreadStore } from "@/store/message/thread";

interface ThreadsListItemProps {
  thread: StandardMessageEntity;
}

const { thread } = defineProps<ThreadsListItemProps>();
const creator = useCreator(() => thread);
const { openThread } = useThreadStore();
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
