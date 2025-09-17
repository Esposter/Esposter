<script setup lang="ts">
import { useReadSearchHistories } from "@/composables/message/useReadSearchHistories";
import { getFilterDisplayValue } from "@/services/message/getFilterDisplayValue";
import { useSearchHistoryStore } from "@/store/message/searchHistory";

const { readMoreSearchHistories, readSearchHistories } = useReadSearchHistories();
const { isPending } = await readSearchHistories();
const searchHistoryStore = useSearchHistoryStore();
const { hasMore, items } = storeToRefs(searchHistoryStore);
</script>

<template>
  <v-card-title text-base font-extrabold>History</v-card-title>
  <v-list py-0 density="compact">
    <v-list-item v-for="{ id, query, filters } in items" :key="id">
      <v-list-item-title font-semibold>{{ query }}</v-list-item-title>
      <v-list-item-subtitle v-if="filters" text-gray>
        {{ filters.map(getFilterDisplayValue).join(", ") }}
      </v-list-item-subtitle>
    </v-list-item>
    <StyledWaypoint v-if="!isPending" :active="hasMore" @change="readMoreSearchHistories" />
  </v-list>
</template>
