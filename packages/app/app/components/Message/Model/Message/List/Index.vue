<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useDataStore } from "@/store/message/data";
import { useScrollStore } from "@/store/message/scroll";

const { readMoreMessages, readMoreNewerMessages: baseReadMoreNewerMessages } = await useReadMessages();
const dataStore = useDataStore();
const { hasMore, hasMoreNewer } = storeToRefs(dataStore);
const scrollStore = useScrollStore();
const { isScrolling, messageContainer, messageContainerElement } = storeToRefs(scrollStore);
const previousScrollHeight = ref(0);
const readMoreNewerMessages = async (onComplete: () => void) => {
  await baseReadMoreNewerMessages(() => {
    requestAnimationFrame(() => {
      if (isScrolling.value || !messageContainerElement.value) return;
      messageContainerElement.value.scrollTop -=
        messageContainerElement.value.scrollHeight - previousScrollHeight.value;
      previousScrollHeight.value = messageContainerElement.value.scrollHeight;
    });
    onComplete();
  });
};

watchOnce(messageContainerElement, (newMessageContainerElement) => {
  if (!newMessageContainerElement) return;
  previousScrollHeight.value = newMessageContainerElement.scrollHeight;
});
</script>

<template>
  <v-list ref="messageContainer" flex-1 flex pb-0 basis-full flex-col-reverse overflow-y-auto="!" lines="two">
    <StyledWaypoint :active="hasMoreNewer" @change="readMoreNewerMessages">
      <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </StyledWaypoint>
    <MessageModelMessageListContainer />
    <StyledWaypoint :active="hasMore" @change="readMoreMessages">
      <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </StyledWaypoint>
  </v-list>
</template>
