<script setup lang="ts">
import { ThemeMode } from "@/models/vuetify/ThemeMode";
import { THEME_COOKIE_NAME, THEME_COOKIE_OPTIONS } from "@/services/vuetify/constants";

defineSlots<{ default: () => VNode }>();

const theme = useVTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME, { ...THEME_COOKIE_OPTIONS, default: () => ThemeMode.system });
const { $ssrClientHints } = useNuxtApp();
const preferredDark = usePreferredDark();
// Vuetify resolves ThemeMode.system through a matchMedia ref that exists only in the browser, so handing it
// The literal mode leaves the server on light and mismatches every v-theme-- class on hydration. The client
// Hint carries the browser's scheme into SSR instead, giving both renders the same concrete theme.
const systemThemeMode = computed(() =>
  $ssrClientHints.colorSchemeFromCookie === ThemeMode.dark ? ThemeMode.dark : ThemeMode.light,
);
await theme.change(themeCookie.value === ThemeMode.system ? systemThemeMode.value : themeCookie.value);

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
