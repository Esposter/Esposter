<script setup lang="ts">
import { FilterType } from "#shared/models/message/FilterType";
import { useSearchFilterStore } from "@/store/message/searchFilter";

const searchFilterStore = useSearchFilterStore();
const { clearFilters, createFilter } = searchFilterStore;
const { hasFilters, selectedFilters } = storeToRefs(searchFilterStore);
const filterTypes = Object.values(FilterType);
const { hasMoreMessagesSearched, messageSearchQuery, messagesSearched } = useMessageSearcher();
const isEmpty = computed(() => !messageSearchQuery.value && !hasFilters.value);
const clearSearch = () => {
  messageSearchQuery.value = "";
  clearFilters();
};
const onEscape = () => {
  (document.activeElement as HTMLElement | null)?.blur();
};
</script>

<template>
  <MessageContentSearchMenu :messages="messagesSearched" :has-more="hasMoreMessagesSearched" @select="createFilter">
    <template #activator="props">
      <v-autocomplete
        v-model="selectedFilters"
        :search="messageSearchQuery"
        cursor-auto
        width="15rem"
        density="compact"
        menu-icon=""
        placeholder="Search"
        chips
        hide-details
        hide-no-data
        multiple
        :="props"
        @keydown.esc="onEscape()"
        @update:search="
          (value) => {
            if (value[value.length - 1] === ':') {
              const filterType = filterTypes.find(
                (type) => type.toLowerCase() === value.slice(0, value.length - 1).toLowerCase(),
              );
              if (filterType) {
                createFilter(filterType);
                return;
              }
            }

            messageSearchQuery = value;
          }
        "
      >
        <template #append-inner>
          <v-icon v-if="isEmpty" icon="mdi-magnify" />
          <v-btn
            v-else
            density="compact"
            icon="mdi-close"
            size="small"
            variant="plain"
            :ripple="false"
            @click="clearSearch()"
          />
        </template>
        <template #chip="{ item: { raw } }">
          <v-chip>{{ raw.type }}: {{ raw.value }} </v-chip>
        </template>
      </v-autocomplete>
    </template>
  </MessageContentSearchMenu>
</template>
