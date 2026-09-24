<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

import { DocsCategories } from "@/models/docs/DocsCategory";
import { getSectionCategory } from "@/services/docs/getSectionCategory";
import { getSectionIcon } from "@/services/docs/getSectionIcon";

interface Props {
  sections: ContentNavigationItem[];
}

const { sections } = defineProps<Props>();
const categories = computed(() =>
  DocsCategories.map((category) => ({
    category,
    categorySections: sections.filter(({ path }) => getSectionCategory(path) === category),
  })).filter(({ categorySections }) => categorySections.length > 0),
);
</script>

<template>
  <nav aria-label="Docs pages">
    <template v-for="{ category, categorySections } of categories" :key="category">
      <p text-muted px-2 pt-2 uppercase>{{ category }}</p>
      <ul list-none>
        <li v-for="section of categorySections" :key="section.path">
          <DocsNavigationLink :icon="getSectionIcon(section.path)" :title="section.title" :to="section.path" />
        </li>
      </ul>
    </template>
  </nav>
</template>
