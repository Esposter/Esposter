<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

import { DOCS_NAVIGATION_OVERVIEW_SUFFIX } from "@/services/docs/constants";
import { getChildNavigationItems } from "@/services/docs/getChildNavigationItems";
import { getNavigationGroups } from "@/services/docs/getNavigationGroups";
import { getOpenedNavigationPaths } from "@/services/docs/getOpenedNavigationPaths";
import { getSectionIcon } from "@/services/docs/getSectionIcon";

interface Props {
  sections: ContentNavigationItem[];
}

const { sections } = defineProps<Props>();
const router = useRouter();
const { cloned: opened } = useCloned(() => getOpenedNavigationPaths(router.currentRoute.value.path));
const sectionsWithGroups = computed(() =>
  sections.map((section) => ({
    groups: getNavigationGroups(section.path, getChildNavigationItems(section)),
    section,
  })),
);
</script>

<template>
  <v-list v-model:opened="opened" color="primary" nav overflow-y-auto>
    <v-list-group v-for="{ groups, section } of sectionsWithGroups" :key="section.path" :value="section.path">
      <template #activator="{ props: activatorProps }">
        <v-list-item
          :="activatorProps"
          class="docs-section-title"
          :prepend-icon="getSectionIcon(section.path)"
          :title="section.title"
        />
      </template>
      <v-list-item
        :active="router.currentRoute.value.path === section.path"
        title="Overview"
        :to="section.path"
        :value="`${section.path}${DOCS_NAVIGATION_OVERVIEW_SUFFIX}`"
      />
      <template v-for="group of groups" :key="group.title ?? ''">
        <v-list-subheader v-if="group.title">{{ group.title }}</v-list-subheader>
        <DocsNavigationList :items="group.items" />
      </template>
    </v-list-group>
  </v-list>
</template>

<style scoped>
/* Three-tier hierarchy: section titles > page items > group subheaders (small caps) */
:deep(.v-list-item-title) {
  font-size: 0.875rem;
}

:deep(.v-list-group__header .v-list-item-title) {
  font-weight: 500;
}

:deep(.docs-section-title .v-list-item-title) {
  font-size: 1rem;
  font-weight: 600;
}

:deep(.v-list-item--active .v-list-item-title) {
  font-weight: 700;
}

/* Nuxt-style vertical guide connecting a group's children to its header */
:deep(.v-list-group__items) {
  border-left: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  margin-left: 1rem;
}

:deep(.v-list-subheader) {
  margin-top: 0.5rem;
}

:deep(.v-list-subheader__text) {
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>
