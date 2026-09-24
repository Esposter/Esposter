<script setup lang="ts">
import type { UiStyle } from "@/models/ui/UiStyle";
import type { ResolvedThemeMode } from "@/models/vuetify/ResolvedThemeMode";

import { UI_STYLE_INJECTION_KEY } from "@/services/ui/constants";
import { getUiTheme } from "@/services/ui/getUiTheme";
import { Theme } from "@vuetify/v0";

interface Props {
  theme: ResolvedThemeMode;
  // A style the region keeps whatever the reader picks, as a game's does; without one it draws in the nearest style
  uiStyle?: UiStyle;
}

defineSlots<{ default: () => VNode }>();
const { theme, uiStyle } = defineProps<Props>();
const nearestUiStyle = useUiStyle();
const scopeUiStyle = computed(() => uiStyle ?? nearestUiStyle.value);
provide(UI_STYLE_INJECTION_KEY, scopeUiStyle);
</script>

<template>
  <!-- Every token beneath takes the scope's palette, and the browser's own controls and scrollbars its scheme. The
    Style is declared again on the scope, so the style tokens that read a colour resolve against that palette -->
  <Theme :theme="getUiTheme(scopeUiStyle, theme)" :style="{ colorScheme: theme }" :data-ui-style="scopeUiStyle">
    <slot />
  </Theme>
</template>
