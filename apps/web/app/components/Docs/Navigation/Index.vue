<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

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
  <nav aria-label="Docs pages">
    <ul list-none>
      <li v-for="{ groups, section } of sectionsWithGroups" :key="section.path">
        <UiCollapsible
          :model-value="opened.includes(section.path)"
          @update:model-value="
            (isOpen) => {
              opened = isOpen ? [...opened, section.path] : opened.filter((openedPath) => openedPath !== section.path);
            }
          "
        >
          <template #title>
            <span :class="getSectionIcon(section.path)" aria-hidden="true" size-5 inline-block />
            <span text-accent>{{ section.title }}</span>
          </template>
          <ul ml-3 pl-2 list-none shadow="[inset_var(--ui-step)_0_0_0_var(--ui-panel-edge)]">
            <li><DocsNavigationLink :to="section.path">Overview</DocsNavigationLink></li>
            <li v-for="group of groups" :key="group.title ?? ''">
              <p v-if="group.title" px-2 pt-2 text-muted uppercase>{{ group.title }}</p>
              <ul list-none>
                <DocsNavigationList v-model:opened="opened" :items="group.items" />
              </ul>
            </li>
          </ul>
        </UiCollapsible>
      </li>
    </ul>
  </nav>
</template>
