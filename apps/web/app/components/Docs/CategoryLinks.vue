<script setup lang="ts">
import type { DocsCategory } from "@/models/docs/DocsCategory";
import type { UiTabLink } from "@/models/ui/UiTabLink";
import type { ContentNavigationItem } from "@nuxt/content";

import { DocsCategories } from "@/models/docs/DocsCategory";
import { DocsCategoryIconMap } from "@/services/docs/DocsCategoryIconMap";
import { getSectionCategory } from "@/services/docs/getSectionCategory";
import { RoutePath } from "@esposter/shared";

interface Props {
  activeCategory?: DocsCategory;
  sections: ContentNavigationItem[];
}

const { activeCategory, sections } = defineProps<Props>();
// Each category lands on its first section, and stays current on every page of every section in it
const tabLinks = computed<UiTabLink[]>(() => [
  { icon: "i-mdi:home", isCurrent: !activeCategory, title: "Overview", to: RoutePath.Docs },
  ...DocsCategories.flatMap((category) => {
    const firstSection = sections.find(({ path }) => getSectionCategory(path) === category);
    return firstSection
      ? [
          {
            icon: DocsCategoryIconMap[category],
            isCurrent: category === activeCategory,
            title: category,
            to: firstSection.path,
          },
        ]
      : [];
  }),
]);
</script>

<template>
  <UiTabLinks :items="tabLinks" is-icon-only label="Docs categories" />
</template>
