<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

interface Props {
  message: MessageEntity;
  nextMessage?: MessageEntity;
}

const { message, nextMessage } = defineProps<Props>();
const creator = useCreator(() => message);
</script>

<template>
  <template v-if="creator">
    <MessageModelMessageListItem :creator :message :next-message />
    <MessageModelMessageTimeline :message-date="message.createdAt" :next-message-date="nextMessage?.createdAt" />
  </template>
</template>
