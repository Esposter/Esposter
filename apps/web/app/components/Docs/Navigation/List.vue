<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

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
      <ul ml-3 pl-2 list-none shadow="[inset_var(--ui-step)_0_0_0_var(--ui-border)]">
        <li v-if="item.page !== false"><DocsNavigationLink :to="item.path">Overview</DocsNavigationLink></li>
        <DocsNavigationList v-model:opened="opened" :items="children" />
      </ul>
    </UiCollapsible>
    <DocsNavigationLink v-else :to="item.path">{{ item.title }}</DocsNavigationLink>
  </li>
</template>
