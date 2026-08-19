<script setup lang="ts">
import { getFilterDisplayValue } from "@/services/message/filter/getFilterDisplayValue";
import { getFilterTypeFromSearchQuery } from "@/services/message/filter/getFilterTypeFromSearchQuery";
import { useSearchMessageStore } from "@/store/message/search";

const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { createFilter } = searchMessageStore;
const { isSearchQueryEmpty, menu, searchQuery, selectedFilters } = storeToRefs(searchMessageStore);
// The query outlives focus — clicking away from a query never empties the field. Vuetify clears its own search
// Text on every focus transition, and the field is controlled, so the store would follow it down: that clear is
// Swallowed rather than undone, because restoring a saved value a tick later overwrites whatever the user typed
// Inside that tick, which is how a one-character search reached the server as an empty query. Swallowing loses
// Nothing — a keystroke in the same window writes the store and stays written
const isFocusTransitioning = ref(false);
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
        if (value) menu = value;
        // Vuetify's clear lands on this same flush, so the flag is up before it arrives and down once it has
        isFocusTransitioning = true;
        await nextTick();
        isFocusTransitioning = false;
      }
    "
    @update:search="
      (value: string) => {
        // Vuetify clearing itself around a focus change, not the user emptying the field
        if (!value && isFocusTransitioning) return;
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
