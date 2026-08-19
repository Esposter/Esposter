<script setup lang="ts">
import { getFilterDisplayValue } from "@/services/message/filter/getFilterDisplayValue";
import { getFilterTypeFromSearchQuery } from "@/services/message/filter/getFilterTypeFromSearchQuery";
import { useSearchMessageStore } from "@/store/message/search";

const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { createFilter } = searchMessageStore;
const { isSearchQueryEmpty, menu, searchQuery, selectedFilters } = storeToRefs(searchMessageStore);
const searchQueryOnFocus = ref("");
const searchInput = useTemplateRef("searchInput");
const blur = () => {
  const input = searchInput.value?.$el.querySelector("input");
  if (!(input instanceof HTMLInputElement)) return;
  input.blur();
};
</script>

<template>
  <v-autocomplete
    ref="searchInput"
    v-model="selectedFilters"
    autocomplete="suppress"
    density="compact"
    menu-icon=""
    placeholder="Search"
    width="100%"
    :item-value="getFilterDisplayValue"
    :search="searchQuery"
    chips
    closable-chips
    hide-details
    hide-no-data
    multiple
    return-object
    cursor-text
    @keydown.esc="blur()"
    @keydown.enter="
      async () => {
        // Enter only ever searches: the colon is what converts a keyword, so by the time Enter is pressed the query
        // Is search text. It never fills a pending chip either — only a picker gives a filter its value
        if (isSearchQueryEmpty) return;
        menu = false;
        blur();
        await readSearchedMessages();
      }
    "
    @update:focused="
      async (value) => {
        // 1. When focus is gained, open the menu and save the current search query
        if (value) {
          menu = value;
          searchQueryOnFocus = searchQuery;
        }
        // 2. Focus lost with a now-empty query: the user selected an item, so restore empty to stop old text reappearing.
        else if (searchQuery === '') searchQueryOnFocus = '';
        // 3. Wait for Vuetify's internal clear to happen, then restore our saved value — but only while it is still
        // Cleared. A character typed inside this tick is the newer value, and restoring the snapshot over it is how a
        // One-character search reached the server as an empty query
        await nextTick();
        if (value && searchQuery === '') searchQuery = searchQueryOnFocus;
      }
    "
    @update:search="
      (value: string) => {
        // Ignore internal clear value callback on blur event
        if (!value && !menu) return;
        if (value) menu = true;

        const filterType = getFilterTypeFromSearchQuery(value);
        if (filterType) {
          createFilter(filterType);
          searchQuery = '';
          return;
        }

        searchQuery = value;
      }
    "
  >
    <template #chip="{ internalItem: { raw }, props: chipProps }">
      <v-chip :="chipProps">
        {{ getFilterDisplayValue(raw) }}
      </v-chip>
    </template>
  </v-autocomplete>
</template>
