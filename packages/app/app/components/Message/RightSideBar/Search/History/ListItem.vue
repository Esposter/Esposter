<script setup lang="ts">
import type { SearchHistoryInMessage } from "@esposter/db-schema";

import { getFilterDisplayValue } from "@/services/message/filter/getFilterDisplayValue";
import { useSearchMessageStore } from "@/store/message/search";

interface MessageRightSideBarSearchHistoryListItemProps {
  searchHistory: SearchHistoryInMessage;
}

const { searchHistory } = defineProps<MessageRightSideBarSearchHistoryListItemProps>();
const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { searchQuery, selectedFilters } = storeToRefs(searchMessageStore);
const displayFilters = computed(() => searchHistory.filters.map((filter) => getFilterDisplayValue(filter)).join(" "));
</script>

<template>
  <v-hover #default="{ isHovering, props }">
    <v-list-item
      :="props"
      @click="
        async () => {
          searchQuery = searchHistory.query;
          selectedFilters = searchHistory.filters;
          await readSearchedMessages();
        }
      "
    >
      <v-list-item-title>{{ displayFilters }} {{ searchHistory.query }}</v-list-item-title>
      <template #append>
        <MessageRightSideBarSearchAddIcon :is-hovering />
      </template>
    </v-list-item>
  </v-hover>
</template>
