<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useMessageStore } from "@/store/esbabbler/message";

const { readMoreMessages, readMoreNewerMessages } = await useReadMessages();
const messageStore = useMessageStore();
const { hasMore, hasMoreNewer, messageContainer } = storeToRefs(messageStore);
const isLoading = ref(false);
const isLoadingNewer = ref(false);
const topWaypoint = ref<HTMLElement | null>(null);
const bottomWaypoint = ref<HTMLElement | null>(null);

useIntersectionObserver(topWaypoint, ([entry]) => {
  if (!entry.isIntersecting || !hasMoreNewer.value || isLoadingNewer.value) return;
  isLoadingNewer.value = true;
  readMoreNewerMessages(() => (isLoadingNewer.value = false));
});

useIntersectionObserver(bottomWaypoint, ([entry]) => {
  if (!entry.isIntersecting || !hasMore.value || isLoading.value) return;
  isLoading.value = true;
  readMoreMessages(() => (isLoading.value = false));
});
</script>

<template>
  <v-list ref="messageContainer" flex-1 flex pb-0 basis-full flex-col-reverse overflow-y-auto="!" lines="two">
    <template v-if="hasMoreNewer">
      <EsbabblerModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <div ref="topWaypoint" aria-hidden="true" h-1 />
    <EsbabblerModelMessageListContainer />
    <div ref="bottomWaypoint" aria-hidden="true" h-1 />
    <template v-if="hasMore">
      <EsbabblerModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
  </v-list>
</template>
