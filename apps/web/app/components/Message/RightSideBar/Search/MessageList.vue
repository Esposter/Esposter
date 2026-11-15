<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/search";

const { readMoreSearchedMessages } = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { hasMore, items } = storeToRefs(searchMessageStore);
</script>

<template>
  <MessageModelMessageSearchList :messages="items">
    <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreSearchedMessages(onComplete)" />
  </MessageModelMessageSearchList>
</template>
