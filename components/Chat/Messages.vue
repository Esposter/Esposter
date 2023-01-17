<script setup lang="ts">
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";
import type { Unsubscribable } from "@trpc/server/observable";
import { ChatModelMessageList } from "~~/.nuxt/components";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = $(storeToRefs(roomStore));
const messageStore = useMessageStore();
const {
  pushMessageList,
  updateMessageListNextCursor,
  initialiseMessageList,
  createMessage,
  updateMessage,
  deleteMessage,
} = messageStore;
const { messageList, messageListNextCursor } = $(storeToRefs(messageStore));
const hasMore = $computed(() => Boolean(messageListNextCursor));
const fetchMoreMessages = async (onComplete: () => void) => {
  try {
    if (!currentRoomId) return;

    const { messages, nextCursor } = await $client.message.readMessages.query({
      partitionKey: currentRoomId,
      cursor: messageListNextCursor,
    });
    pushMessageList(messages);
    updateMessageListNextCursor(nextCursor);
  } finally {
    onComplete();
  }
};

if (currentRoomId) {
  const { messages, nextCursor } = await $client.message.readMessages.query({
    partitionKey: currentRoomId,
    cursor: null,
  });
  initialiseMessageList(messages);
  updateMessageListNextCursor(nextCursor);
}

let createMessageUnsubscribable = $ref<Unsubscribable>();
let updateMessageUnsubscribable = $ref<Unsubscribable>();
let deleteMessageUnsubscribable = $ref<Unsubscribable>();

onMounted(() => {
  if (!currentRoomId) return;

  createMessageUnsubscribable = $client.message.onCreateMessage.subscribe(
    { partitionKey: currentRoomId },
    { onData: (data) => createMessage(data) }
  );
  updateMessageUnsubscribable = $client.message.onUpdateMessage.subscribe(
    { partitionKey: currentRoomId },
    { onData: (data) => updateMessage(data) }
  );
  deleteMessageUnsubscribable = $client.message.onDeleteMessage.subscribe(
    { partitionKey: currentRoomId },
    { onData: (data) => deleteMessage(data) }
  );
});

onUnmounted(() => {
  createMessageUnsubscribable?.unsubscribe();
  updateMessageUnsubscribable?.unsubscribe();
  deleteMessageUnsubscribable?.unsubscribe();
});
</script>

<template>
  <ChatModelMessageList :messages="messageList" :has-more="hasMore" :fetch-more-messages="fetchMoreMessages" />
</template>
