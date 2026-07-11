<script setup lang="ts">
import type { DocsSearchSection } from "@/models/docs/DocsSearchSection";

import { ContentCollection } from "#shared/models/content/ContentCollection";
import { MAX_DOCS_SEARCH_RESULTS } from "@/services/docs/constants";
import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import MiniSearch from "minisearch";

const isOpen = ref(false);
const query = ref("");
const { data: searchSections } = useAsyncData(
  AsyncDataKey.DocsSearchSections,
  () => queryCollectionSearchSections(ContentCollection.Docs),
  { server: false },
);
const miniSearch = computed(() => {
  const index = new MiniSearch<DocsSearchSection>({
    fields: ["title", "content"],
    searchOptions: { fuzzy: 0.2, prefix: true },
    storeFields: ["title", "titles"],
  });
  index.addAll(searchSections.value ?? []);
  return index;
});
const results = computed(() =>
  query.value
    ? (miniSearch.value.search(query.value).slice(0, MAX_DOCS_SEARCH_RESULTS) as unknown as Pick<
        DocsSearchSection,
        "id" | "title" | "titles"
      >[])
    : [],
);

useVHotkey("ctrl+k", () => {
  isOpen.value = !isOpen.value;
});
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ class: 'mx-2' }"
    icon="mdi-magnify"
    text="Search (Ctrl+K)"
    @click="isOpen = true"
  />
  <v-dialog v-model="isOpen" width="600">
    <v-card>
      <v-text-field
        v-model="query"
        autofocus
        clearable
        hide-details
        placeholder="Search docs"
        prepend-inner-icon="mdi-magnify"
        variant="solo"
      />
      <template v-if="query">
        <v-divider />
        <v-list v-if="results.length > 0" max-h-96 overflow-y-auto>
          <v-list-item
            v-for="result of results"
            :key="result.id"
            :subtitle="result.titles.join(' › ')"
            :title="result.title"
            :to="result.id"
            @click="isOpen = false"
          />
        </v-list>
        <p v-else m-0 p-4 text-center op-medium-emphasis>No results for "{{ query }}"</p>
      </template>
    </v-card>
  </v-dialog>
</template>
