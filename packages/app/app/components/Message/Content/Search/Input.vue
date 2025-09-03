<script setup lang="ts">
import { FilterType } from "#shared/models/message/FilterType";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const emit = defineEmits<{ search: [query: string] }>();
const searchMessageStore = useSearchMessageStore();
const { createFilter } = searchMessageStore;
const { selectedFilters } = storeToRefs(searchMessageStore);
const filterTypes = Object.values(FilterType);
const searchQuery = defineModel<string>({ default: "" });
const activeSelectedFilter = computed({
  get: () => selectedFilters.value.at(-1),
  set: (value) => {
    if (!value) return;
    selectedFilters.value[selectedFilters.value.length - 1] = value;
  },
});
const onEscape = () => (document.activeElement as HTMLElement | null)?.blur();
</script>

<template>
  <v-autocomplete
    v-model="selectedFilters"
    :search="searchQuery"
    cursor-auto
    width="15rem"
    density="compact"
    menu-icon=""
    placeholder="Search"
    chips
    hide-details
    hide-no-data
    multiple
    @keydown.enter="
      ({ preventDefault }: KeyboardEvent) => {
        if (activeSelectedFilter && !activeSelectedFilter.value) {
          const value = searchQuery.trim();
          if (!value) return;
          activeSelectedFilter.value = value;
          preventDefault();
          searchQuery = '';
        } else emit('search', searchQuery);
      }
    "
    @keydown.esc="onEscape()"
    @update:search="
      (value: string) => {
        if (value[value.length - 1] === ':') {
          const filterType = filterTypes.find(
            (type) => type.toLowerCase() === value.slice(0, value.length - 1).toLowerCase(),
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
      <v-chip>{{ raw.type }}: {{ raw.value }} </v-chip>
    </template>
  </v-autocomplete>
</template>
