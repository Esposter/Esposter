<script setup lang="ts">
import { useSearchFilterStore } from "@/store/message/searchFilter";

const searchFilterStore = useSearchFilterStore();
const { clearFilters } = searchFilterStore;
const { hasFilters } = storeToRefs(searchFilterStore);
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
  <MessageContentSearchMenu :messages="messagesSearched" :has-more="hasMoreMessagesSearched">
    <template #activator="props">
      <v-text-field
        v-model="messageSearchQuery"
        cursor-auto
        width="15rem"
        placeholder="Search"
        density="compact"
        hide-details
        :="props"
        @keydown.esc="onEscape()"
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
      </v-text-field>
    </template>
  </MessageContentSearchMenu>
  <MessageContentSearchFilterChips />
</template>
