<script setup lang="ts">
import type { ClientMessage } from "@/models/message/ClientMessage";

import { MessageComponentMap } from "@/services/message/MessageComponentMap";

interface Props {
  thread: ClientMessage;
}

const { thread } = defineProps<Props>();
const creator = useCreator(() => thread);
const openThread = useOpenThread();
</script>

<template>
  <component
    :is="MessageComponentMap[thread.type]"
    :creator
    :message="thread"
    is-preview
    @click="openThread(thread.roomId, thread.id)"
  />
</template>
