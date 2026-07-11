<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

import { getSectionIcon } from "@/services/docs/getSectionIcon";
import { RoutePath } from "@esposter/shared";

interface SectionTabsProps {
  sections: ContentNavigationItem[];
}

const { sections } = defineProps<SectionTabsProps>();
const route = useRoute();
const activeSectionPath = computed(
  () => sections.find(({ path }) => route.path === path || route.path.startsWith(`${path}/`))?.path ?? RoutePath.Docs,
);
</script>

<template>
  <div class="section-tabs" sticky top="[--app-bar-height]" z-1 bg-surface>
    <v-tabs color="primary" density="compact" :model-value="activeSectionPath" show-arrows>
      <v-tab exact prepend-icon="mdi-home" :to="RoutePath.Docs" :value="RoutePath.Docs">Overview</v-tab>
      <v-tab
        v-for="section of sections"
        :key="section.path"
        :prepend-icon="getSectionIcon(section.path)"
        :to="section.path"
        :value="section.path"
      >
        {{ section.title }}
      </v-tab>
    </v-tabs>
  </div>
</template>

<style scoped>
.section-tabs {
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.section-tabs :deep(.v-tab) {
  letter-spacing: normal;
  text-transform: none;
}
</style>
