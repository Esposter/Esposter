<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";

interface Props extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, message } = defineProps<Props>();
const scrollToMessage = useScrollToMessage();
</script>

<template>
  <MessageModelMessageTypeSystemLine :active icon="i-mdi:pin" :is-preview :message>
    <span>{{ creator.name }}</span>
    <span text-muted> pinned </span>
    <button
      type="button"
      text-info
      cursor-pointer
      hover:underline
      @click="message.replyRowKey && scrollToMessage(message.partitionKey, message.replyRowKey)"
    >
      a message
    </button>
    <span text-muted> to this room.</span>
  </MessageModelMessageTypeSystemLine>
</template>
