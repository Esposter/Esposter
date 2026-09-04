<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { MessageComponentMap } from "@/services/message/MessageComponentMap";

interface SearchListItemProps {
  message: MessageEntity;
}

const { message } = defineProps<SearchListItemProps>();
const creator = useCreator(() => message);
const scrollToMessage = useScrollToMessage();
</script>

<template>
  <component
    :is="MessageComponentMap[message.type]"
    v-if="creator"
    :creator
    :message
    is-preview
    @click="scrollToMessage(message.partitionKey, message.rowKey)"
  />
</template>
