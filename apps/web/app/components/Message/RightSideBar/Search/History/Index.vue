<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getFilterDisplayValue } from "@/services/message/filter/getFilterDisplayValue";
import { useSearchMessageStore } from "@/store/message/search";
import { useSearchHistoryStore } from "@/store/message/search/history";

const { readMoreSearchHistories, readSearchHistories } = useReadSearchHistories();
const { isPending } = await readSearchHistories();
const searchHistoryStore = useSearchHistoryStore();
const { hasMore, items } = storeToRefs(searchHistoryStore);
const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { searchQuery, selectedFilters } = storeToRefs(searchMessageStore);
const listItems = computed(() =>
  items.value.map<UiListItem<string>>(({ filters, id, query }) => ({
    meaning: UiIconMeaning.Recent,
    title: [...filters.map((filter) => getFilterDisplayValue(filter)), query].join(" "),
    value: id,
  })),
);
</script>

<!-- A past search runs again as it was, its filters and its words, on a pick -->
<template>
  <section v-if="isPending || items.length > 0" flex flex-col gap-1>
    <h3 text-sm text-muted px-2>History</h3>
    <div v-if="isPending" aria-busy="true" flex flex-col>
      <div v-for="i in 3" :key="i" ui-row>
        <UiSkeleton shrink-0 size-6 />
        <UiSkeleton flex-1 h-4 />
      </div>
    </div>
    <template v-else>
      <UiList
        :items="listItems"
        label="History"
        @select="
          async (id) => {
            const searchHistory = items.find((item) => item.id === id);
            if (!searchHistory) return;
            searchQuery = searchHistory.query;
            selectedFilters = searchHistory.filters;
            await readSearchedMessages();
          }
        "
      />
      <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreSearchHistories(onComplete)" />
    </template>
  </section>
</template>
