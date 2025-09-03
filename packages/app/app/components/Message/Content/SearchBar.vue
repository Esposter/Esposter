<script setup lang="ts">
import { FilterType } from "#shared/models/message/FilterType";
import { useReadSearchedMessages } from "@/composables/message/useReadSearchedMessages";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { clearFilters, createFilter } = searchMessageStore;
const { hasFilters, hasMore, items, selectedFilters } = storeToRefs(searchMessageStore);
const activeSelectedFilter = computed({
  get: () => selectedFilters.value.at(-1),
  set: (value) => {
    if (!value) return;
    selectedFilters.value[selectedFilters.value.length - 1] = value;
  },
});
const filterTypes = Object.values(FilterType);
const readSearchedMessages = useReadSearchedMessages();
const messageSearchQuery = ref("");
const isEmpty = computed(() => !messageSearchQuery.value && !hasFilters.value);
const onEscape = () => {
  (document.activeElement as HTMLElement | null)?.blur();
};
</script>

<template>
  <MessageContentSearchMenu :messages="items" :has-more @select="createFilter">
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
        @keydown.enter="
          async ({ preventDefault }: KeyboardEvent) => {
            if (activeSelectedFilter && !activeSelectedFilter.value) {
              const value = messageSearchQuery.trim();
              if (!value) return;
              activeSelectedFilter.value = value;
              preventDefault();
              messageSearchQuery = '';
              return;
            }

            await readSearchedMessages({ query: messageSearchQuery });
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
                messageSearchQuery = '';
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
            @click="
              () => {
                messageSearchQuery = '';
                clearFilters();
              }
            "
          />
        </template>
        <template #chip="{ item: { raw } }">
          <v-chip>{{ raw.type }}: {{ raw.value }} </v-chip>
        </template>
      </v-autocomplete>
    </template>
  </MessageContentSearchMenu>
</template>
