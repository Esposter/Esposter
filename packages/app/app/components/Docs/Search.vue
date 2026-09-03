<script setup lang="ts">
import type { DocsSearchSection } from "@/models/docs/DocsSearchSection";

import { ContentCollection } from "#shared/models/content/ContentCollection";
import { DocsSearchSectionPropertyNames } from "@/models/docs/DocsSearchSection";
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
    fields: [DocsSearchSectionPropertyNames.title, DocsSearchSectionPropertyNames.content],
    searchOptions: {
      boost: { [DocsSearchSectionPropertyNames.title]: 2 },
      combineWith: "AND",
      fuzzy: 0.2,
      prefix: true,
    },
    storeFields: [DocsSearchSectionPropertyNames.title, DocsSearchSectionPropertyNames.titles],
  });
  index.addAll(searchSections.value ?? []);
  return index;
});
// Group hits by page and keep only the best-scoring section per page (results arrive relevance-sorted),
// So one page matching in many sections can't flood the list — the DocSearch/VitePress behavior
const results = computed(() => {
  if (!query.value) return [];
  const pagePathResultsMap = new Map<string, { id: string; subtitle: string; title: string }>();
  for (const searchResult of miniSearch.value.search(query.value)) {
    // MiniSearch's SearchResult cannot express storeFields — it declares none of them, so there is no overlap
    // For a direct cast and nothing to annotate. The fields are the ones the index above was told to store
    const { id, title, titles } = searchResult as unknown as Pick<DocsSearchSection, "id" | "title" | "titles">;
    const pagePath = id.split("#")[0] || id;
    if (!pagePathResultsMap.has(pagePath))
      pagePathResultsMap.set(pagePath, { id, subtitle: titles.join(" › ") || pagePath, title });
    if (pagePathResultsMap.size === MAX_DOCS_SEARCH_RESULTS) break;
  }
  return [...pagePathResultsMap.values()];
});
</script>

<template>
  <StyledSearchDialog v-model="isOpen" v-model:search-query="query" hotkey="ctrl+k" placeholder="Search docs">
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton
        :button-props="{ class: 'mx-2' }"
        icon="mdi-magnify"
        text="Search (Ctrl+K)"
        @click="updateIsOpen(true)"
      />
    </template>
    <template v-if="query">
      <v-divider />
      <v-list v-if="results.length > 0" max-h-96 overflow-y-auto>
        <v-list-item
          v-for="result of results"
          :key="result.id"
          :subtitle="result.subtitle"
          :title="result.title"
          :to="result.id"
          @click="isOpen = false"
        />
      </v-list>
      <p v-else m-0 p-4 text-center op-medium-emphasis>No results for "{{ query }}"</p>
    </template>
  </StyledSearchDialog>
</template>
