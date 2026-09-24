<script setup lang="ts">
import type { ResolvedThemeMode } from "@/models/vuetify/ResolvedThemeMode";

import { ThemeMode } from "@/models/vuetify/ThemeMode";
import { UI_STYLE_INJECTION_KEY } from "@/services/ui/constants";
import { THEME_COOKIE_NAME, THEME_COOKIE_OPTIONS } from "@/services/vuetify/constants";
import { useUiStyleStore } from "@/store/ui/style";

defineSlots<{ default: () => VNode }>();
const theme = useVTheme();
const selectUiTheme = useSelectUiTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME, { ...THEME_COOKIE_OPTIONS, default: () => ThemeMode.system });
const { $ssrClientHints } = useNuxtApp();
const uiStyleStore = useUiStyleStore();
const { uiStyle } = storeToRefs(uiStyleStore);
// The root's design style, which the style tier's rule is keyed on. Here rather than in `App.vue`, because the status
// Page renders in its place and needs the style as much
useHead({ htmlAttrs: { "data-ui-style": uiStyle } });
provide(UI_STYLE_INJECTION_KEY, uiStyle);
const preferredDark = usePreferredDark();
// Vuetify resolves ThemeMode.system through a matchMedia ref that exists only in the browser, so handing it
// The literal mode leaves the server on light and mismatches every v-theme-- class on hydration. The client
// Hint carries the browser's scheme into SSR instead, giving both renders the same concrete theme.
const systemThemeMode = computed(() =>
  $ssrClientHints.colorSchemeFromCookie === ThemeMode.dark ? ThemeMode.dark : ThemeMode.light,
);
await theme.change(themeCookie.value === ThemeMode.system ? systemThemeMode.value : themeCookie.value);
// Vuetify's theme is the one selection of the mode during the migration, so the library's follows it and the reader's
// Style — on the server render as well, which an immediate watcher runs in and a lazy one does not
watchImmediate([uiStyle, () => theme.global.name.value], ([newUiStyle, newThemeName]) => {
  // Vuetify types its theme name as a bare string, while the themes it is given are exactly the resolved modes
  selectUiTheme(newUiStyle, newThemeName as ResolvedThemeMode);
});

onMounted(() => {
  // The hint is chromium-only and absent on a first request, so the media query is what finally settles a
  // System preference — after hydration, where a theme change is a repaint instead of a mismatch.
  watchImmediate(preferredDark, async (newPreferredDark) => {
    if (themeCookie.value !== ThemeMode.system) return;
    await theme.change(newPreferredDark ? ThemeMode.dark : ThemeMode.light);
  });
});
</script>

<template>
  <slot />
</template>
