<script setup lang="ts">
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const client = useClient();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const messageStore = useMessageStore();
const { pushMessages, updateMessageNextCursor } = messageStore;
const { messages, messageNextCursor } = storeToRefs(messageStore);
const hasMore = computed(() => Boolean(messageNextCursor.value));
const fetchMoreMessages = async (finishLoading: () => void) => {
  if (!currentRoomId.value) return;

  const { messages, nextCursor } = await client.query("message.readMessages", {
    filter: { partitionKey: currentRoomId.value },
    cursor: messageNextCursor.value,
  });
  pushMessages(messages);
  updateMessageNextCursor(nextCursor);
  finishLoading();
};
</script>

<template>
  <v-list display="flex" flex="1 col-reverse" basis="full" lines="two">
    <ChatMessageListItem v-for="message in messages" :key="message.rowKey" :message="message" />
    <Waypoint :active="hasMore" @change="fetchMoreMessages" />
  </v-list>
</template>
