<script setup lang="ts">
import type { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import type { RouteLocationRaw } from "vue-router";

interface Props {
  to: RouteLocationRaw;
  variant?: UiButtonVariant;
}

// Somewhere to go that reads as something to press: a real link, so it opens in a new tab like any other, in the
// Button's look
defineSlots<{ default: () => VNode }>();
const { to, variant } = defineProps<Props>();
</script>

<template>
  <NuxtLink :to :data-variant="variant" ui-button no-underline inline-flex gap-2 items-center>
    <slot />
  </NuxtLink>
</template>
