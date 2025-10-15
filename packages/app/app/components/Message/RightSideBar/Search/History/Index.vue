<script setup lang="ts">
import { getFilterDisplayValue } from "@/services/message/filter/getFilterDisplayValue";
import { useSearchHistoryStore } from "@/store/message/searchHistory";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const readSearchedMessages = useReadSearchedMessages();
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
    <template v-if="!isPending">
      <v-hover v-for="{ id, query, filters } in items" :key="id" #default="{ isHovering, props }">
        <v-list-item
          :="props"
          @click="
            async () => {
              const history = items.find((i) => i.id === id);
              if (!history) return;
              searchQuery = history.query;
              selectedFilters = history.filters;
              await readSearchedMessages();
            }
          "
        >
          <v-list-item-title>
            {{ filters.map((f) => getFilterDisplayValue(f)).join(" ") }} {{ query }}
          </v-list-item-title>
          <template #append>
            <v-icon :op="isHovering ? undefined : '0!'" icon="mdi-plus" />
          </template>
        </v-list-item>
      </v-hover>
      <StyledWaypoint :is-active="hasMore" @change="readMoreSearchHistories" />
    </template>
  </v-list>
</template>
