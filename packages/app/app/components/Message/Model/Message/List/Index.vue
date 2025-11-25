<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useDataStore } from "@/store/message/data";
import { useScrollStore } from "@/store/message/scroll";

const { readMessages, readMoreMessages, readMoreNewerMessages: baseReadMoreNewerMessages } = useReadMessages();
const { isPending } = await readMessages();
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
  <v-list
    ref="messageContainer"
    flex-1
    flex
    pb-0
    basis-full
    flex-col-reverse
    overflow-x-hidden
    overflow-y-auto
    lines="two"
  >
    <template v-if="isPending">
      <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-else>
      <StyledWaypoint :is-active="hasMoreNewer" @change="readMoreNewerMessages">
        <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
      <MessageModelMessageListContainer />
      <StyledWaypoint :is-active="hasMore" @change="readMoreMessages">
        <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
