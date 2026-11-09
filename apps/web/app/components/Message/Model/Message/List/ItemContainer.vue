<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

interface Props {
  message: MessageEntity;
  nextMessage?: MessageEntity;
}

const { message } = defineProps<Props>();
const creator = useCreator(() => message);
</script>

<template>
  <MessageModelMessageListItem :creator :message :next-message />
  <MessageModelMessageTimeline :message-date="message.createdAt" :next-message-date="nextMessage?.createdAt" />
</template>
