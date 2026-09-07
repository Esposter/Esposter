<script setup lang="ts">
import { useSearchHistoryStore } from "@/store/message/search/history";

const { readMoreSearchHistories, readSearchHistories } = useReadSearchHistories();
const { isPending } = await readSearchHistories();
const searchHistoryStore = useSearchHistoryStore();
const { hasMore, items } = storeToRefs(searchHistoryStore);
</script>

<template>
  <v-card-title font-extrabold text-title-medium>History</v-card-title>
  <v-list py-0 density="compact">
    <template v-if="!isPending">
      <MessageRightSideBarSearchHistoryListItem v-for="item of items" :key="item.id" :search-history="item" />
      <StyledWaypoint :is-active="hasMore" @change="readMoreSearchHistories" />
    </template>
  </v-list>
</template>
