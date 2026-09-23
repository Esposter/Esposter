<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";

interface Props extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, message } = defineProps<Props>();
const scrollToMessage = useScrollToMessage();
</script>

<template>
  <MessageModelMessageTypeSystemLine :active icon="i-mdi:pin" :is-preview :message>
    <span fw-bold>{{ creator.name }}</span>
    <span op-medium-emphasis> pinned </span>
    <span
      fw-bold
      cursor-pointer
      hover:underline
      @click="message.replyRowKey && scrollToMessage(message.partitionKey, message.replyRowKey)"
    >
      a message
    </span>
    <span op-medium-emphasis> to this room. </span>
  </MessageModelMessageTypeSystemLine>
</template>
