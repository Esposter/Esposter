<script setup lang="ts">
import type { DocsCategory } from "@/models/docs/DocsCategory";
import type { ContentNavigationItem } from "@nuxt/content";

interface Props {
  category?: DocsCategory;
  categorySections: ContentNavigationItem[];
  sections: ContentNavigationItem[];
}

// Everything that finds a page, in the one column: search, the categories, then the pages of the one open
const { category, categorySections, sections } = defineProps<Props>();
</script>

<template>
  <div p-2 flex flex-1 flex-col gap-2 min-h-0 ui-body>
    <AppSearchButton label="Search docs" />
    <DocsCategoryLinks :active-category="category" :sections />
    <DocsNavigation v-if="category" :sections="categorySections" flex-1 min-h-0 of-y-auto />
    <DocsNavigationOverview v-else :sections flex-1 min-h-0 of-y-auto />
  </div>
</template>
