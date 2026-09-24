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
          <DocsNavigationLink :to="section.path">
            <span :class="getSectionIcon(section.path)" aria-hidden="true" size-5 inline-block />{{ section.title }}
          </DocsNavigationLink>
        </li>
      </ul>
    </template>
  </nav>
</template>
