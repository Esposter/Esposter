<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

import { DOCS_NAVIGATION_OVERVIEW_SUFFIX } from "@/services/docs/constants";
import { getChildNavigationItems } from "@/services/docs/getChildNavigationItems";

interface Props {
  items: ContentNavigationItem[];
}

const { items } = defineProps<Props>();
const { currentRoute } = useRouter();
const itemsWithChildren = computed(() => items.map((item) => ({ children: getChildNavigationItems(item), item })));
</script>

<template>
  <template v-for="{ children, item } of itemsWithChildren" :key="item.path">
    <v-list-group v-if="children.length > 0" :value="item.path">
      <template #activator="{ props: activatorProps }">
        <v-list-item :="activatorProps" :title="item.title" />
      </template>
      <v-list-item
        v-if="item.page !== false"
        :active="currentRoute.path === item.path"
        title="Overview"
        :to="item.path"
        :value="`${item.path}${DOCS_NAVIGATION_OVERVIEW_SUFFIX}`"
      />
      <DocsNavigationList :items="children" />
    </v-list-group>
    <v-list-item v-else :active="currentRoute.path === item.path" :title="item.title" :to="item.path" />
  </template>
</template>
