<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

import { RESOURCE_SEARCH_LISTBOX_ID } from "@/services/resource/search/constants";
import { getResourceSearchOptionId } from "@/services/resource/search/getResourceSearchOptionId";
import { RoutePath } from "@esposter/shared";

interface Props {
  // Home's landing mount: the panel drops down over the page instead of rendering statically (dialog mount)
  isInline?: true;
  placeholder?: string;
}

const { isInline, placeholder = "Search resources, services, and pages" } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
const searchQuery = ref("");
const { addRecentSearch, isPending, items } = useResourceSearchItems(searchQuery);
const root = useTemplateRef("root");
const isPanelVisible = ref(!isInline);
const selectedIndex = ref(-1);
// The See-all footer participates in keyboard navigation as the last option
const itemCount = computed(() => items.value.length + (searchQuery.value ? 1 : 0));
const seeAllTo = computed<RouteLocationRaw>(() => ({
  path: RoutePath.ResourceExplorerAll,
  query: searchQuery.value ? { search: searchQuery.value } : {},
}));
const select = () => {
  addRecentSearch(searchQuery.value);
  if (isInline) isPanelVisible.value = false;
  emit("select");
};
// -1 and the footer index both fall back to See-all, matching the plain "Enter submits the search" behavior
const onEnter = async () => {
  const to = items.value[selectedIndex.value]?.to ?? seeAllTo.value;
  select();
  await navigateTo(to);
};

watch(items, () => {
  selectedIndex.value = -1;
});

onClickOutside(root, () => {
  if (isInline) isPanelVisible.value = false;
});
</script>

<template>
  <div ref="root" w-full relative>
    <v-text-field
      v-model="searchQuery"
      :aria-activedescendant="selectedIndex >= 0 ? getResourceSearchOptionId(selectedIndex) : undefined"
      :aria-controls="RESOURCE_SEARCH_LISTBOX_ID"
      :aria-expanded="isPanelVisible"
      :autofocus="!isInline"
      :placeholder
      aria-autocomplete="list"
      variant="solo"
      prepend-inner-icon="mdi-magnify"
      role="combobox"
      clearable
      @focus="isPanelVisible = true"
      @keydown.down.prevent="selectedIndex = itemCount > 0 ? (selectedIndex + 1) % itemCount : -1"
      @keydown.up.prevent="
        selectedIndex = itemCount > 0 ? (selectedIndex <= 0 ? itemCount - 1 : selectedIndex - 1) : -1
      "
      @keydown.enter="!$event.isComposing && onEnter()"
      @keydown.esc="
        () => {
          if (isInline) isPanelVisible = false;
        }
      "
    />
    <!-- The inline panel needs an explicit z-index: the sibling v-cards below are position: relative,
      So they paint over a DOM-earlier positioned element with auto z-index -->
    <v-card
      v-if="isPanelVisible"
      :class="isInline ? ['absolute', 'left-0', 'right-0', 'top-full', 'z-1'] : []"
      mt-2
      max-h-100
      overflow-y-auto
    >
      <v-progress-linear v-if="isPending" indeterminate />
      <ResourceSearchResultList :items :search-query :see-all-to :selected-index @select="select()" />
    </v-card>
  </div>
</template>
