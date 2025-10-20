<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

interface MessageListItemContainerProps {
  message: MessageEntity;
  nextMessage?: MessageEntity;
}

const { message, nextMessage } = defineProps<MessageListItemContainerProps>();
const creator = useCreator(() => message);
</script>

<template>
  <template v-if="creator">
    <MessageModelMessageListItem :creator :message :next-message />
    <MessageModelMessageTimeline :message-date="message.createdAt" :next-message-date="nextMessage?.createdAt" />
  </template>
</template>
