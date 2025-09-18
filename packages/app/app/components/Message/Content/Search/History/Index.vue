<script setup lang="ts">
import { useReadSearchHistories } from "@/composables/message/useReadSearchHistories";
import { getFilterDisplayValue } from "@/services/message/getFilterDisplayValue";
import { useSearchHistoryStore } from "@/store/message/searchHistory";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const { readMoreSearchHistories, readSearchHistories } = useReadSearchHistories();
const { isPending } = await readSearchHistories();
const searchMessageStore = useSearchMessageStore();
const { searchQuery, selectedFilters } = storeToRefs(searchMessageStore);
const searchHistoryStore = useSearchHistoryStore();
const { hasMore, items } = storeToRefs(searchHistoryStore);
</script>

<template>
  <v-card-title text-base font-extrabold>History</v-card-title>
  <v-list py-0 density="compact">
    <v-hover v-for="{ id, query, filters } in items" :key="id" #default="{ isHovering, props }">
      <v-list-item
        :="props"
        @click="
          () => {
            const history = items.find((i) => i.id === id);
            if (!history) return;
            selectedFilters = history.filters;
            searchQuery = history.query;
          }
        "
      >
        <v-list-item-title> {{ filters.map(getFilterDisplayValue).join(" ") }} {{ query }} </v-list-item-title>
        <template #append>
          <v-icon :op="isHovering ? undefined : '0!'" icon="mdi-plus" />
        </template>
      </v-list-item>
    </v-hover>
    <StyledWaypoint v-if="!isPending" :active="hasMore" @change="readMoreSearchHistories" />
  </v-list>
</template>
