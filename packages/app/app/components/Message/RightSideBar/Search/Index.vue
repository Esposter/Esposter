<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/search";

const { isSearching } = storeToRefs(useSearchMessageStore());
</script>

<!-- One surface, not two tabs. Browsing a room's attachments is a filter like every other narrowing — `has: file`
     — so a tab for it was a second way to ask the same question, with its own result slice to keep apart -->
<template>
  <MessageRightSideBarSearchHeader />
  <v-divider />
  <MessageRightSideBarSearchMessageList v-if="!isSearching" />
</template>
