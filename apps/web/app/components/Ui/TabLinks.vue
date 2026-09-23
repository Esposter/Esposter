<script setup lang="ts">
import type { UiTabLink } from "@/models/ui/UiTabLink";

interface Props {
  items: UiTabLink[];
  // The navigation's accessible name: what its links move between
  label: string;
}

// Tabs that go somewhere rather than show a panel, so each is a real link in the tab order and the current one says so
const { items, label } = defineProps<Props>();
</script>

<template>
  <nav :aria-label="label" ui-tab-list>
    <NuxtLink
      v-for="{ icon, isCurrent, title, to } of items"
      :key="title"
      :to
      :aria-current="isCurrent ? 'page' : undefined"
      gap-2
      items-center
      flex
      ui-tab
    >
      <span v-if="icon" :class="icon" aria-hidden="true" size-5 inline-block />{{ title }}
    </NuxtLink>
  </nav>
</template>
