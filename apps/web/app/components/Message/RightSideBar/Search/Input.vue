<script setup lang="ts">
import { checkIsFilterPending } from "#shared/services/message/checkIsFilterPending";
import { getFilterDisplayValue } from "@/services/message/filter/getFilterDisplayValue";
import { getFilterTypeFromSearchQuery } from "@/services/message/filter/getFilterTypeFromSearchQuery";
import { SearchFilterComponentMap } from "@/services/message/filter/SearchFilterComponentMap";
import { useSearchMessageStore } from "@/store/message/search";

const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { createFilter } = searchMessageStore;
const { activeSelectedFilter, isMenuOpen, isSearchQueryEmpty, searchQuery, selectedFilters } =
  storeToRefs(searchMessageStore);
</script>

<!-- Discord's search: filters typed into the one field become chips before the text, and the panel under it offers
     What to type next, a past search to run again, or the picker a filter still waiting for its value opens -->
<template>
  <UiTokenField
    v-model:is-open="isMenuOpen"
    v-model:tokens="selectedFilters"
    :get-token-title="getFilterDisplayValue"
    label="Search"
    :text="searchQuery"
    @submit="
      async () => {
        // Enter only ever searches: the colon is what converts a keyword, so by the time Enter is pressed the query
        // Is search text. It never fills a pending chip either — only a picker gives a filter its value
        if (isSearchQueryEmpty) return;
        await readSearchedMessages();
      }
    "
    @update:text="
      (value) => {
        const filterType = getFilterTypeFromSearchQuery(value);
        // The keyword and its colon become the chip, so the text they were typed into is left empty
        if (filterType) {
          createFilter(filterType);
          searchQuery = '';
        } else searchQuery = value;
      }
    "
  >
    <template #panel="{ focus }">
      <component
        :is="SearchFilterComponentMap[activeSelectedFilter.type]"
        v-if="activeSelectedFilter && checkIsFilterPending(activeSelectedFilter)"
        @select="
          (value) => {
            if (!activeSelectedFilter) return;
            activeSelectedFilter.value = value;
            focus();
          }
        "
      />
      <template v-else>
        <MessageRightSideBarSearchOptions />
        <MessageRightSideBarSearchHistory />
      </template>
    </template>
  </UiTokenField>
</template>
