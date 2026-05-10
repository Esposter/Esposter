<script setup lang="ts">
import { getFilterDisplayValue } from "@/services/message/filter/getFilterDisplayValue";
import { useSearchMessageStore } from "@/store/message/search";
import { FilterTypes } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";

const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { createFilter } = searchMessageStore;
const { activeSelectedFilter, isSearchQueryEmpty, menu, searchQuery, selectedFilters } =
  storeToRefs(searchMessageStore);
const searchQueryOnFocus = ref("");
const filterTypes = [...FilterTypes];
const blur = () => (document.activeElement as HTMLElement | null)?.blur();
</script>

<template>
  <v-autocomplete
    v-model="selectedFilters"
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
    cursor-text
    @keydown.esc="blur()"
    @keydown.enter="
      async () => {
        if (activeSelectedFilter && !activeSelectedFilter.value) {
          const value = normalizeString(searchQuery);
          if (!value) return;
          activeSelectedFilter.value = value;
          searchQuery = '';
        } else if (!isSearchQueryEmpty) {
          blur();
          await readSearchedMessages();
        }
      }
    "
    @update:focused="
      async (value) => {
        // 1. When focus is gained, open the menu and save the current search query
        if (value) {
          menu = value;
          searchQueryOnFocus = searchQuery;
        }
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
          const normalizedValue = normalizeString(value);
          const filterType = filterTypes.find(
            (type) => type.toLowerCase() === normalizedValue.slice(0, normalizedValue.length - 1).toLowerCase(),
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
    <template #chip="{ internalItem: { raw } }">
      <v-chip>
        {{ getFilterDisplayValue(raw) }}
      </v-chip>
    </template>
  </v-autocomplete>
</template>
