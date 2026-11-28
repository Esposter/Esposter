<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

interface Props {
  to: RouteLocationRaw;
}

defineOptions({ inheritAttrs: false });
defineSlots<{ default: () => VNode }>();
defineProps<Props>();
</script>

<template>
  <NuxtLink :to :="$attrs">
    <slot />
  </NuxtLink>
</template>

<style scoped>
@layer uno-base {
  a {
    color: inherit;
    text-decoration: none;
  }
}
</style>
