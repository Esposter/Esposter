<script setup lang="ts">
import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";
import type { RouteLocationRaw } from "vue-router";

import { RESOURCE_SEARCH_LISTBOX_ID } from "@/services/resource/search/constants";
import { getResourceSearchOptionId } from "@/services/resource/search/getResourceSearchOptionId";

interface ResultListProps {
  items: ResourceSearchItem[];
  searchQuery: string;
  seeAllTo: RouteLocationRaw;
  selectedIndex: number;
}

const { items, searchQuery, seeAllTo, selectedIndex } = defineProps<ResultListProps>();
const emit = defineEmits<{ select: [] }>();
// StyledList scrolls by DOM child index, so the selected flat index is offset by the subheaders before it
const selectedDomIndex = computed(() => {
  if (selectedIndex < 0) return undefined;
  let subheaderCount = 0;
  for (const [index, item] of items.entries()) {
    if (items[index - 1]?.group !== item.group) subheaderCount++;
    if (index === selectedIndex) return index + subheaderCount;
  }
  // The See-all footer sits after every item and subheader
  return items.length + subheaderCount;
});
</script>

<template>
  <StyledList
    :list-attrs="{ id: RESOURCE_SEARCH_LISTBOX_ID, role: 'listbox' }"
    :list-props="{ density: 'compact' }"
    :selected-index="selectedDomIndex"
  >
    <v-list-item
      v-if="items.length === 0"
      disabled
      :title="
        searchQuery
          ? `No resources found for '${searchQuery}'`
          : 'Start typing to search resources, services, and pages'
      "
    />
    <template v-for="({ createTo, group, icon, id, subtitle, title, to }, index) of items" :key="id">
      <v-list-subheader v-if="items[index - 1]?.group !== group">{{ group }}</v-list-subheader>
      <v-list-item
        :id="getResourceSearchOptionId(index)"
        :active="selectedIndex === index"
        :prepend-icon="icon"
        role="option"
        :subtitle
        :to
        @click="emit('select')"
      >
        <template #title>
          <ResourceSearchHighlightedTitle :search-query :text="title" />
        </template>
        <template v-if="createTo" #append>
          <StyledTooltipIconButton
            icon="mdi-plus"
            text="Create"
            :button-props="{ size: 'small', variant: 'text', to: createTo }"
            @click="
              (event) => {
                event.stopPropagation();
                emit('select');
              }
            "
          />
        </template>
      </v-list-item>
    </template>
    <v-list-item
      v-if="searchQuery"
      :id="getResourceSearchOptionId(items.length)"
      :active="selectedIndex === items.length"
      append-icon="mdi-arrow-right"
      role="option"
      title="See all results"
      :to="seeAllTo"
      @click="emit('select')"
    />
  </StyledList>
</template>
