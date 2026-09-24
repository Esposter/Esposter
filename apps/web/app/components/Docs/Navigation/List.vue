<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getChildNavigationItems } from "@/services/docs/getChildNavigationItems";

interface Props {
  items: ContentNavigationItem[];
}

const opened = defineModel<string[]>("opened", { required: true });
const { items } = defineProps<Props>();
const itemsWithChildren = computed(() => items.map((item) => ({ children: getChildNavigationItems(item), item })));
</script>

<template>
  <li v-for="{ children, item } of itemsWithChildren" :key="item.path">
    <!-- A group's chevron is its mark, so its title lines up with the pages' beside it -->
    <UiCollapsible
      v-if="children.length > 0"
      :model-value="opened.includes(item.path)"
      @update:model-value="
        (isOpen) => {
          opened = isOpen ? [...opened, item.path] : opened.filter((openedPath) => openedPath !== item.path);
        }
      "
    >
      <template #title>{{ item.title }}</template>
      <ul ml-3 pl-2 list-none ui-guide>
        <li v-if="item.page !== false">
          <DocsNavigationLink :meaning="UiIconMeaning.Summary" title="Overview" :to="item.path" />
        </li>
        <DocsNavigationList v-model:opened="opened" :items="children" />
      </ul>
    </UiCollapsible>
    <DocsNavigationLink v-else :meaning="UiIconMeaning.File" :title="item.title" :to="item.path" />
  </li>
</template>
