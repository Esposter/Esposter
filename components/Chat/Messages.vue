<script setup lang="ts">
import type { MessageEntity } from "@/services/azure/types";
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const messageStore = useMessageStore();
const { pushMessageList, updateMessageListNextCursor, initialiseMessageList } = messageStore;
const { messageList, messageListNextCursor } = storeToRefs(messageStore);
const hasMore = $computed(() => Boolean(messageListNextCursor.value));
const fetchMoreMessages = async (onComplete: () => void) => {
  if (!currentRoomId.value) return;

  const { messages, nextCursor } = await $client.message.readMessages.query({
    filter: { partitionKey: currentRoomId.value },
    cursor: messageListNextCursor.value,
  });
  pushMessageList(messages);
  updateMessageListNextCursor(nextCursor);
  onComplete();
};

const { messages, nextCursor } = currentRoomId.value
  ? await $client.message.readMessages.query({ filter: { partitionKey: currentRoomId.value }, cursor: null })
  : { messages: [] as MessageEntity[], nextCursor: null };
initialiseMessageList(messages);
updateMessageListNextCursor(nextCursor);
</script>

<template>
  <ChatModelMessageList :messages="messageList" :has-more="hasMore" :fetch-more-messages="fetchMoreMessages" />
</template>
