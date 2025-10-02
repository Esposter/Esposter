<script setup lang="ts">
import { FilterType } from "#shared/models/message/FilterType";
import { getFilterDisplayValue } from "@/services/message/getFilterDisplayValue";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { createFilter } = searchMessageStore;
const { activeSelectedFilter, isSearchQueryEmpty, menu, searchQuery, selectedFilters } =
  storeToRefs(searchMessageStore);
const searchQueryOnFocus = ref("");
const filterTypes = Object.values(FilterType);
const onEscape = () => (document.activeElement as HTMLElement | null)?.blur();
</script>

<template>
  <v-autocomplete
    v-model="selectedFilters"
    cursor-text
    autocomplete="suppress"
    density="compact"
    menu-icon=""
    placeholder="Search"
    width="100%"
    :item-value="getFilterDisplayValue"
    :search="searchQuery"
    chips
    hide-details
    hide-no-data
    multiple
    return-object
    @keydown.esc="onEscape()"
    @keydown.enter="
      async ({ preventDefault }: KeyboardEvent) => {
        if (activeSelectedFilter && !activeSelectedFilter.value) {
          const value = searchQuery.trim();
          if (!value) return;
          activeSelectedFilter.value = value;
          preventDefault();
          searchQuery = '';
        } else if (!isSearchQueryEmpty) await readSearchedMessages();
      }
    "
    @update:focused="
      async (value) => {
        menu = value;
        // 1. When focus is gained, save the current search query
        if (value) searchQueryOnFocus = searchQuery;
        // 2. When focus is lost, if the query is now empty but wasn't on focus,
        // it means the user selected an item, so we restore the empty string
        // This prevents the old text from reappearing after selection
        else if (searchQuery === '') searchQueryOnFocus = '';
        // 3. Wait for Vuetify's internal clear to happen, then restore our saved value.
        await nextTick();
        if (value) searchQuery = searchQueryOnFocus;
      }
    "
    @update:search="
      (value: string) => {
        // Ignore internal clear value callback on blur event
        if (!value && !menu) return;

        if (value[value.length - 1] === ':') {
          const trimmedValue = value.trim();
          const filterType = filterTypes.find(
            (type) => type.toLowerCase() === trimmedValue.slice(0, trimmedValue.length - 1).toLowerCase(),
          );
          if (filterType) {
            createFilter(filterType);
            searchQuery = '';
            return;
          }
        }

        searchQuery = value;
      }
    "
  >
    <template #chip="{ item: { raw } }">
      <v-chip>
        {{ getFilterDisplayValue(raw) }}
      </v-chip>
    </template>
  </v-autocomplete>
</template>
