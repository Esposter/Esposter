<script setup lang="ts">
import { useMessageStore } from "@/store/esbabbler/message";

const messageStore = useMessageStore();
const { messageList, messageListNextCursor } = storeToRefs(messageStore);
const hasMore = computed(() => Boolean(messageListNextCursor.value));
const readMoreMessages = await useReadMessages();
</script>

<template>
  <EsbabblerModelMessageList
    v-if="messageList"
    :messages="messageList"
    :has-more="hasMore"
    :read-more-messages="readMoreMessages"
  />
</template>
