<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { MessageComponentMap } from "@/services/message/MessageComponentMap";

interface Props {
  thread: MessageEntity;
}

const { thread } = defineProps<Props>();
const creator = useCreator(() => thread);
const openThread = useOpenThread();
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
