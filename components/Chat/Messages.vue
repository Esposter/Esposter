<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { MessageEntity } from "@/services/azure/types";
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const messageStore = useMessageStore();
const { pushMessageList, updateMessageListNextCursor, initialiseMessageList } = messageStore;
const { messageList, messageListNextCursor } = storeToRefs(messageStore);
const hasMore = $computed(() => Boolean(messageListNextCursor.value));
const fetchMoreMessages = async (finishLoading: () => void) => {
  if (!currentRoomId.value) return;

  const { data } = await $client.message.readMessages.query({
    filter: { partitionKey: currentRoomId.value },
    cursor: messageListNextCursor.value,
  });
  if (data.value) {
    pushMessageList(data.value.messages);
    updateMessageListNextCursor(data.value.nextCursor);
    finishLoading();
  }
};

const { data } = currentRoomId.value
  ? await $client.message.readMessages.query({ filter: { partitionKey: currentRoomId.value }, cursor: null })
  : { data: { value: { messages: [] as MessageEntity[], nextCursor: null } } };
if (data.value) {
  initialiseMessageList(data.value.messages);
  updateMessageListNextCursor(data.value.nextCursor);
}
</script>

<template>
  <ChatModelMessageList :messages="messageList" :has-more="hasMore" :fetch-more-messages="fetchMoreMessages" />
</template>
