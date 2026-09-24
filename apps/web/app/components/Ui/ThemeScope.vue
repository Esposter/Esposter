<script setup lang="ts">
import type { UiTheme } from "@/models/ui/UiTheme";

import { UiStyle } from "@/models/ui/UiStyle";
import { Theme, useTheme } from "@vuetify/v0";

interface Props {
  theme: UiTheme;
}

defineSlots<{ default: () => VNode }>();
const { theme } = defineProps<Props>();
const { get } = useTheme();
// Every token beneath takes the scoped theme's value, and the browser's own controls and scrollbars take its scheme. The
// Style is declared again on the scope, so the style tokens that read a colour resolve against the scope's palette
const colorScheme = computed(() => (get(theme)?.dark ? "dark" : "light"));
</script>

<template>
  <Theme :theme :style="{ colorScheme }" :data-ui-style="UiStyle.Voxel">
    <slot />
  </Theme>
</template>
