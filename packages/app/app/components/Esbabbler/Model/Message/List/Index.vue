<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useMessageStore } from "@/store/esbabbler/message";

const { readMoreMessages, readMoreNewerMessages } = await useReadMessages();
const messageStore = useMessageStore();
const { hasMore, hasMoreNewer, messageContainer, messages } = storeToRefs(messageStore);
const isLoadingOlder = ref(false);
const isLoadingNewer = ref(false);
const topWaypoint = ref<HTMLElement | null>(null);
const bottomWaypoint = ref<HTMLElement | null>(null);

useIntersectionObserver(topWaypoint, ([entry]) => {
  if (!entry.isIntersecting || !hasMoreNewer.value || isLoadingNewer.value) return;
  isLoadingNewer.value = true;
  readMoreNewerMessages(() => (isLoadingNewer.value = false));
});

useIntersectionObserver(bottomWaypoint, ([entry]) => {
  if (!entry.isIntersecting || !hasMore.value || isLoadingOlder.value) return;
  isLoadingOlder.value = true;
  readMoreMessages(() => (isLoadingOlder.value = false));
});
</script>

<template>
  <v-list ref="messageContainer" flex-1 flex pb-0 basis-full flex-col-reverse overflow-y-auto="!" lines="two">
    <template v-if="isLoadingNewer">
      <EsbabblerModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <div ref="topWaypoint" aria-hidden="true" h-1 />
    <EsbabblerModelMessageListItemContainer
      v-for="(message, index) of messages"
      :key="message.rowKey"
      :current-message="message"
      :next-message="messages[index + 1]"
    />
    <div ref="bottomWaypoint" aria-hidden="true" h-1 />
    <template v-if="isLoadingOlder">
      <EsbabblerModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
  </v-list>
</template>
