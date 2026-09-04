<script setup lang="ts">
import type { DocsCategory } from "@/models/docs/DocsCategory";
import type { ContentNavigationItem } from "@nuxt/content";

import { DocsCategories } from "@/models/docs/DocsCategory";
import { DocsCategoryIconMap } from "@/services/docs/DocsCategoryIconMap";
import { getSectionCategory } from "@/services/docs/getSectionCategory";
import { useLayoutStore } from "@/store/layout";
import { RoutePath } from "@esposter/shared";

interface Props {
  activeCategory?: DocsCategory;
  sections: ContentNavigationItem[];
}

const { activeCategory, sections } = defineProps<Props>();
const layoutStore = useLayoutStore();
const { isLeftDrawerOpen, isLeftDrawerOpenAuto } = storeToRefs(layoutStore);
const { currentRoute } = useRouter();
// Vuetify highlights a tab from its router link, never from the tabs' model value, and every docs page resolves
// To the same [...slug] route, so a link only counts as active on its own exact path. Each tab lands on its
// Category's first section, except the active one, which points at the page you are on so that it stays lit
const categories = computed(() =>
  DocsCategories.flatMap((category) => {
    const firstSection = sections.find(({ path }) => getSectionCategory(path) === category);
    if (!firstSection) return [];
    else if (category === activeCategory) return [{ category, path: currentRoute.value.path }];
    else return [{ category, path: firstSection.path }];
  }),
);
</script>

<template>
  <div class="category-tabs" top="[--app-bar-height]" flex items-center sticky z-1>
    <StyledTooltipIconButton
      v-if="!isLeftDrawerOpenAuto"
      :button-props="{ size: 'small' }"
      icon="mdi-menu"
      text="Show Navigation"
      :tooltip-props="{ location: 'bottom' }"
      @click="isLeftDrawerOpen = true"
    />
    <v-tabs color="primary" :model-value="activeCategory ?? RoutePath.Docs" show-arrows>
      <!-- Exact, or "/docs" resolves with no slug param and counts as active on every docs page -->
      <v-tab class="text-none" exact prepend-icon="mdi-home" :to="RoutePath.Docs" :value="RoutePath.Docs">
        Overview
      </v-tab>
      <v-tab
        v-for="{ category, path } of categories"
        :key="category"
        class="text-none"
        :prepend-icon="DocsCategoryIconMap[category]"
        :to="path"
        :value="category"
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
