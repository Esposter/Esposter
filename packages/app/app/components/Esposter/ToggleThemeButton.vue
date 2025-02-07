<script setup lang="ts">
import { ThemeMode } from "@/models/vuetify/ThemeMode";
import { THEME_COOKIE_NAME } from "@/services/vuetify/constants";

const theme = useGlobalTheme();
const isDark = useIsDark();
const themeCookie = useCookie(THEME_COOKIE_NAME);
const button = useTemplateRef("button");
const toggleTheme = async () => {
  const newThemeValue = isDark.value ? ThemeMode.light : ThemeMode.dark;
  const updateTheme = () => {
    themeCookie.value = theme.name.value = newThemeValue;
  };

  if (!button.value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    updateTheme();
    return;
  }

  const { height, left, top, width } = button.value.getBoundingClientRect();
  const x = left + width / 2;
  const y = top + height / 2;
  const right = window.innerWidth - left;
  const bottom = window.innerHeight - top;
  const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));

  await document.startViewTransition(async () => {
    await nextTick(() => {
      updateTheme();
    });
  }).ready;
  document.documentElement.animate(
    {
      clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
    },
    {
      duration: 500,
      easing: "ease-in-out",
      pseudoElement: "::view-transition-new(root)",
    },
  );
};
</script>

<template>
  <v-tooltip location="bottom" text="Dark Mode">
    <template #activator="{ props }">
      <v-avatar color="background">
        <div ref="button">
          <v-btn :icon="isDark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'" :="props" @click="toggleTheme" />
        </div>
      </v-avatar>
    </template>
  </v-tooltip>
</template>

<style lang="scss">
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
</style>
