<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

import { getOpenedNavigationPaths } from "@/services/docs/getOpenedNavigationPaths";
import { getSectionIcon } from "@/services/docs/getSectionIcon";

interface NavigationProps {
  sections: ContentNavigationItem[];
}

const { sections } = defineProps<NavigationProps>();
const route = useRoute();
const opened = ref(getOpenedNavigationPaths(route.path));
</script>

<template>
  <v-list v-model:opened="opened" overflow-y-auto color="primary" nav>
    <v-list-group v-for="section of sections" :key="section.path" :value="section.path">
      <template #activator="{ props: activatorProps }">
        <v-list-item :="activatorProps" :prepend-icon="getSectionIcon(section.path)" :title="section.title" />
      </template>
      <v-list-item title="Overview" :to="section.path" exact />
      <DocsNavigationList :items="(section.children ?? []).filter(({ path }) => path !== section.path)" />
    </v-list-group>
  </v-list>
</template>

<style scoped>
:deep(.v-list-group__header .v-list-item-title) {
  font-weight: 500;
}

:deep(.v-list-item--active .v-list-item-title) {
  font-weight: 700;
}

/* Nuxt-style vertical guide connecting a group's children to its header */
:deep(.v-list-group__items) {
  border-left: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  margin-left: 1rem;
}
</style>
