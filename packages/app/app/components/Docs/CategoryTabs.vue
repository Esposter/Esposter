<script setup lang="ts">
import type { DocsCategory } from "@/models/docs/DocsCategory";
import type { ContentNavigationItem } from "@nuxt/content";

import { DocsCategories } from "@/models/docs/DocsCategory";
import { DocsCategoryIconMap } from "@/services/docs/DocsCategoryIconMap";
import { getSectionCategory } from "@/services/docs/getSectionCategory";
import { RoutePath } from "@esposter/shared";

interface CategoryTabsProps {
  activeCategory?: DocsCategory;
  sections: ContentNavigationItem[];
}

const { activeCategory, sections } = defineProps<CategoryTabsProps>();
// Each tab lands on its category's first section
const categories = computed(() =>
  DocsCategories.map((category) => ({
    category,
    firstSection: sections.find(({ path }) => getSectionCategory(path) === category),
  })).filter(({ firstSection }) => firstSection !== undefined),
);
</script>

<template>
  <div class="category-tabs" top="[--app-bar-height]" flex items-center sticky z-1>
    <v-tabs color="primary" :model-value="activeCategory ?? RoutePath.Docs" show-arrows>
      <v-tab class="text-none" prepend-icon="mdi-home" :value="RoutePath.Docs" @click="navigateTo(RoutePath.Docs)">
        Overview
      </v-tab>
      <v-tab
        v-for="{ category, firstSection } of categories"
        :key="category"
        class="text-none"
        :prepend-icon="DocsCategoryIconMap[category]"
        :value="category"
        @click="firstSection && navigateTo(firstSection.path)"
      >
        {{ category }}
      </v-tab>
    </v-tabs>
    <v-spacer />
    <DocsSearch />
  </div>
</template>

<style scoped>
/* Opaque so page content cannot show through while the bar is stuck */
.category-tabs {
  background-color: rgb(var(--v-theme-surface));
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
