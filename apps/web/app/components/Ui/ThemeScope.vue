<script setup lang="ts">
import type { UiTheme } from "@/models/ui/UiTheme";

import { Theme, useTheme } from "@vuetify/v0";

interface Props {
  theme: UiTheme;
}

defineSlots<{ default: () => VNode }>();
const { theme } = defineProps<Props>();
const { get } = useTheme();
// Every token beneath takes the scoped theme's value, and the browser's own controls and scrollbars take its scheme
const colorScheme = computed(() => (get(theme)?.dark ? "dark" : "light"));
</script>

<template>
  <Theme :theme :style="{ colorScheme }">
    <slot />
  </Theme>
</template>
