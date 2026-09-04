<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

import { DocsCategories } from "@/models/docs/DocsCategory";
import { getSectionCategory } from "@/services/docs/getSectionCategory";
import { getSectionIcon } from "@/services/docs/getSectionIcon";

interface Props {
  sections: ContentNavigationItem[];
}

const { sections } = defineProps<Props>();
const { currentRoute } = useRouter();
const categories = computed(() =>
  DocsCategories.map((category) => ({
    category,
    categorySections: sections.filter(({ path }) => getSectionCategory(path) === category),
  })).filter(({ categorySections }) => categorySections.length > 0),
);
</script>

<template>
  <v-list color="primary" nav overflow-y-auto>
    <template v-for="{ category, categorySections } of categories" :key="category">
      <v-list-subheader>{{ category }}</v-list-subheader>
      <v-list-item
        v-for="section of categorySections"
        :key="section.path"
        :active="currentRoute.path === section.path"
        :prepend-icon="getSectionIcon(section.path)"
        :title="section.title"
        :to="section.path"
      />
    </template>
  </v-list>
</template>

<style scoped>
:deep(.v-list-item--active .v-list-item-title) {
  font-weight: 700;
}
</style>
