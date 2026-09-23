<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

interface Props {
  to: RouteLocationRaw;
}

// A page in the docs navigation, in the accent while it is the page open, which the router marks as current
defineSlots<{ default: () => VNode }>();
const { to } = defineProps<Props>();
</script>

<template>
  <NuxtLink :to class="aria-[current=page]:text-accent" text-inherit no-underline flex gap-2 items-center ui-item>
    <slot />
  </NuxtLink>
</template>
