<script setup lang="ts">
import { FilterType } from "#shared/models/message/FilterType";
import { getFilterDisplayValue } from "@/services/message/getFilterDisplayValue";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const readSearchedMessages = useReadSearchedMessages();
const searchMessageStore = useSearchMessageStore();
const { createFilter } = searchMessageStore;
const { activeSelectedFilter, isSearchQueryEmpty, menu, searchQuery, selectedFilters } =
  storeToRefs(searchMessageStore);
const filterTypes = Object.values(FilterType);
const onEscape = () => (document.activeElement as HTMLElement | null)?.blur();
</script>

<template>
  <v-autocomplete
    v-model="selectedFilters"
    :item-value="getFilterDisplayValue"
    :search="searchQuery"
    cursor-auto
    width="100%"
    density="compact"
    menu-icon=""
    placeholder="Search"
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
    @update:focused="(value) => (menu = value)"
    @update:search="
      (value: string) => {
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
