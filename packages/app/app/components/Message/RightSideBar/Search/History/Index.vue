<script setup lang="ts">
import { getFilterDisplayValue } from "@/services/message/filter/getFilterDisplayValue";
import { useSearchMessageStore } from "@/store/message/search";
import { useSearchHistoryStore } from "@/store/message/search/history";

const readSearchedMessages = useReadSearchedMessages();
const { readMoreSearchHistories, readSearchHistories } = useReadSearchHistories();
const { isPending } = await readSearchHistories();
const searchMessageStore = useSearchMessageStore();
const { searchQuery, selectedFilters } = storeToRefs(searchMessageStore);
const searchHistoryStore = useSearchHistoryStore();
const { hasMore, items } = storeToRefs(searchHistoryStore);
</script>

<template>
  <v-card-title font-extrabold text-title-medium>History</v-card-title>
  <v-list py-0 density="compact">
    <template v-if="!isPending">
      <v-hover v-for="{ id, query, filters } in items" :key="id" #default="{ isHovering, props }">
        <v-list-item
          :="props"
          @click="
            async () => {
              searchQuery = query;
              selectedFilters = filters;
              await readSearchedMessages();
            }
          "
        >
          <v-list-item-title>
            {{ filters.map((filter) => getFilterDisplayValue(filter)).join(" ") }} {{ query }}
          </v-list-item-title>
          <template #append>
            <MessageRightSideBarSearchAddIcon :is-hovering="isHovering ?? false" />
          </template>
        </v-list-item>
      </v-hover>
      <StyledWaypoint :is-active="hasMore" @change="readMoreSearchHistories" />
    </template>
  </v-list>
</template>
