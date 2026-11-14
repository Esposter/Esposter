<script setup lang="ts">
import type { ClientMessage } from "@/models/message/ClientMessage";

interface Props {
  message: ClientMessage;
  nextMessage?: ClientMessage;
}

const { message } = defineProps<Props>();
const creator = useCreator(() => message);
</script>

<template>
  <MessageModelMessageListItem :creator :message :next-message />
  <MessageModelMessageTimeline :message-date="message.createdAt" :next-message-date="nextMessage?.createdAt" />
</template>
