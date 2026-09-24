<script setup lang="ts">
import { UiStyle } from "@/models/ui/UiStyle";
import { ThemeMode } from "@/models/vuetify/ThemeMode";
import { THEME_COOKIE_NAME, THEME_COOKIE_OPTIONS } from "@/services/vuetify/constants";

defineSlots<{ default: () => VNode }>();
const theme = useVTheme();
const selectUiTheme = useSelectUiTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME, { ...THEME_COOKIE_OPTIONS, default: () => ThemeMode.system });
const { $ssrClientHints } = useNuxtApp();
// The root's design style, which the style tier's rule is keyed on. Here rather than in `App.vue`, because the status
// Page renders in its place and needs the style as much
useHead({ htmlAttrs: { "data-ui-style": UiStyle.Voxel } });
const preferredDark = usePreferredDark();
// Vuetify resolves ThemeMode.system through a matchMedia ref that exists only in the browser, so handing it
// The literal mode leaves the server on light and mismatches every v-theme-- class on hydration. The client
// Hint carries the browser's scheme into SSR instead, giving both renders the same concrete theme.
const systemThemeMode = computed(() =>
  $ssrClientHints.colorSchemeFromCookie === ThemeMode.dark ? ThemeMode.dark : ThemeMode.light,
);
await theme.change(themeCookie.value === ThemeMode.system ? systemThemeMode.value : themeCookie.value);
// Vuetify's theme is the one selection during the migration, so the library's follows it — on the server render as
// Well, which an immediate watcher runs in and a lazy one does not
watchImmediate(
  () => theme.global.name.value,
  (newThemeName) => {
    // Vuetify types its theme name as a bare string, while the themes it is given are exactly the resolved modes
    selectUiTheme(newThemeName as Exclude<ThemeMode, ThemeMode.system>);
  },
);

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
