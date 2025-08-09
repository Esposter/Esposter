<script setup lang="ts">
import { useMessageStore } from "@/store/esbabbler/message";

const { readMoreMessages, readMoreNewerMessages } = await useReadMessages();
const messageStore = useMessageStore();
const { hasMore, hasMoreNewer, messages } = storeToRefs(messageStore);
</script>

<template>
  <v-list flex-1 flex pb-0 basis-full flex-col-reverse overflow-y-auto="!" lines="two">
    <StyledWaypoint :active="hasMoreNewer" @change="readMoreNewerMessages" />
    <EsbabblerModelMessageListItemContainer
      v-for="(message, index) of messages"
      :key="message.rowKey"
      :current-message="message"
      :next-message="messages[index + 1]"
    />
    <StyledWaypoint :active="hasMore" @change="readMoreMessages" />
  </v-list>
</template>
