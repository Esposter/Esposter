<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";
import { useSearchMessageStore } from "@/store/message/search";

const layoutStore = useLayoutStore();
const { isRightDrawerOpen } = storeToRefs(layoutStore);
const searchMessageStore = useSearchMessageStore();
const { isSearching } = storeToRefs(searchMessageStore);
</script>

<!-- One surface, not two tabs. Browsing a room's attachments is a filter like every other narrowing — `has: file`
     — so a tab for it was a second way to ask the same question, with its own result slice to keep apart -->
<template>
  <MessageRightSideBarHeader title="Search" @close="isRightDrawerOpen = false" />
  <MessageRightSideBarSearchHeader />
  <MessageRightSideBarSearchMessageList v-if="!isSearching" />
</template>
