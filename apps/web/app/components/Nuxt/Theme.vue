<script setup lang="ts">
import { UI_STYLE_INJECTION_KEY } from "@/services/ui/constants";
import { useUiStyleStore } from "@/store/ui/style";
import { useThemeModeStore } from "@/store/ui/themeMode";

defineSlots<{ default: () => VNode }>();
const uiStyleStore = useUiStyleStore();
const { uiStyle } = storeToRefs(uiStyleStore);
const themeModeStore = useThemeModeStore();
const { isSystemDark, resolvedThemeMode, themeMode } = storeToRefs(themeModeStore);
// The root's design style, which the style tier's rule is keyed on. Here rather than in `App.vue`, because the status
// Page renders in its place and needs the style as much
useHead({ htmlAttrs: { "data-ui-style": uiStyle } });
provide(UI_STYLE_INJECTION_KEY, uiStyle);
useSelectUiTheme(uiStyle, themeMode, resolvedThemeMode);
const isPreferredDark = usePreferredDark();

onMounted(() => {
  // After hydration, where a change of scheme is a repaint instead of a mismatch
  watchImmediate(isPreferredDark, (newIsPreferredDark) => {
    isSystemDark.value = newIsPreferredDark;
  });
});
</script>

<template>
  <slot />
</template>
