<script setup lang="ts">
import { useNavigationTrailStore } from "@/store/navigationTrail";

const navigationTrailStore = useNavigationTrailStore();
const { crumbs } = storeToRefs(navigationTrailStore);
const items = computed(() => crumbs.value.map(({ path, title }) => ({ title, to: path })));
</script>

<!-- Where the visitor came from, not where the url sits in the route tree — the page they are on is the
     header's title, and a page they arrived at directly has nothing above it to render.
     See /docs/platform/breadcrumb-trail -->
<template>
  <v-breadcrumbs v-if="items.length > 0" :items p-0>
    <template #item="{ item }">
      <v-breadcrumbs-item :to="item.to">
        {{ item.title }}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>
