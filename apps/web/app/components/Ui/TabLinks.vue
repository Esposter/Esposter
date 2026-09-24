<script setup lang="ts">
import type { UiTabLink } from "@/models/ui/UiTabLink";

interface Props {
  // Each link its icon alone, named by its title and showing it as a tooltip, for a row with little width
  isIconOnly?: true;
  items: UiTabLink[];
  // The navigation's accessible name: what its links move between
  label: string;
}

// Tabs that go somewhere rather than show a panel, so each is a real link in the tab order and the current one says so
const { isIconOnly, items, label } = defineProps<Props>();
</script>

<template>
  <nav :aria-label="label" ui-tab-list>
    <UiTooltip
      v-for="{ icon, isCurrent, title, to } of items"
      #default="{ activatorProps }"
      :key="title"
      :disabled="!isIconOnly"
      :label="title"
    >
      <NuxtLink
        :="activatorProps"
        :to
        :aria-current="isCurrent ? 'page' : undefined"
        :aria-label="isIconOnly ? title : undefined"
        ui-tab
        flex
        gap-2
        items-center
      >
        <span v-if="icon" :class="icon" aria-hidden="true" size-5 inline-block />
        <template v-if="!isIconOnly">{{ title }}</template>
      </NuxtLink>
    </UiTooltip>
  </nav>
</template>
