<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/search";

const searchMessageStore = useSearchMessageStore();
const { hasFiles, isSearching } = storeToRefs(searchMessageStore);
const readSearchedMessages = useReadSearchedMessages();
const tab = computed({
  get: () => (hasFiles.value ? "files" : "search"),
  set: (value) => {
    hasFiles.value = value === "files";
    // Selecting the Files tab immediately lists the room's attachments. Leaving it needs no read — each tab
    // Owns its own result slice in the store, so the Search tab is already showing its own results.
    if (hasFiles.value) readSearchedMessages(0);
  },
});
</script>

<template>
  <v-tabs v-model="tab" grow density="compact">
    <v-tab value="search" text="Search" />
    <v-tab value="files" text="Files in this room" />
  </v-tabs>
  <v-divider />
  <MessageRightSideBarSearchHeader v-if="!hasFiles" />
  <v-divider v-if="!hasFiles" />
  <MessageRightSideBarSearchMessageList v-if="!isSearching" />
</template>
