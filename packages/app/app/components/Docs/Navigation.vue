<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

import { getOpenedNavigationPaths } from "@/services/docs/getOpenedNavigationPaths";
import { RoutePath } from "@esposter/shared";

interface NavigationProps {
  items: ContentNavigationItem[];
}

const { items } = defineProps<NavigationProps>();
const route = useRoute();
const opened = ref(getOpenedNavigationPaths(route.path));
</script>

<template>
  <v-list v-model:opened="opened" color="primary" density="compact" nav slim overflow-y-auto>
    <v-list-item title="Overview" :to="RoutePath.Docs" exact />
    <DocsNavigationList :items />
  </v-list>
</template>

<style scoped>
:deep(.v-list-group__header .v-list-item-title) {
  font-weight: 500;
}
</style>
