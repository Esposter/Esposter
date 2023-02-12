<script setup lang="ts">
import { useMessageStore } from "@/store/chat/useMessageStore";

const messageStore = useMessageStore();
const { messageList, messageListNextCursor } = $(storeToRefs(messageStore));
const hasMore = $computed(() => Boolean(messageListNextCursor));
const { readMoreMessages } = await useReadMessages();
</script>

<template>
  <ChatModelMessageList
    v-if="messageList"
    :messages="messageList"
    :has-more="hasMore"
    :read-more-messages="readMoreMessages"
  />
</template>
