<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

interface NavigationListProps {
  items: ContentNavigationItem[];
}

const { items } = defineProps<NavigationListProps>();
</script>

<template>
  <template v-for="item of items" :key="item.path">
    <v-list-group v-if="item.children && item.children.length > 0" :value="item.path">
      <template #activator="{ props: activatorProps }">
        <v-list-item :="activatorProps" :title="item.title" />
      </template>
      <v-list-item v-if="item.page !== false" title="Overview" :to="item.path" exact />
      <DocsNavigationList :items="item.children" />
    </v-list-group>
    <v-list-item v-else :title="item.title" :to="item.path" />
  </template>
</template>
