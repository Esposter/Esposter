<script setup lang="ts">
import { useSearchMessageStore } from "#src/store/message/search/index";

const { readMoreSearchedMessages } = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { hasMore, items } = storeToRefs(searchMessageStore);
</script>

<template>
  <MessageModelMessageSearchList :messages="items">
    <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreSearchedMessages(onComplete)" />
  </MessageModelMessageSearchList>
</template>
