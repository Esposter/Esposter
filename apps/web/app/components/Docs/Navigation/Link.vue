<script setup lang="ts">
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import type { RouteLocationRaw } from "vue-router";

interface Props {
  // A section's own glyph, written whole
  icon?: string;
  meaning?: UiIconMeaning;
  title: string;
  to: RouteLocationRaw;
}
// A page in the docs navigation, one row led by its mark, in the accent while it is the page open, which the router
// Marks as current
const { icon, meaning, title, to } = defineProps<Props>();
</script>

<template>
  <NuxtLink :to class="aria-[current=page]:text-accent" text-inherit ui-item no-underline>
    <UiItemContent :icon :meaning :title />
  </NuxtLink>
</template>
