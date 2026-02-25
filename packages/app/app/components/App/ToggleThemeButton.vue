<script setup lang="ts">
import type { ThemeMode } from "@/models/vuetify/ThemeMode";

import { ThemeModeIconMap } from "@/services/vuetify/ThemeModeIconMap";
import { ThemeModeTooltipMap } from "@/services/vuetify/ThemeModeTooltipMap";

const globalTheme = useGlobalTheme();
const currentTheme = computed(() => globalTheme.name.value as ThemeMode);
const button = useTemplateRef("button");
const baseToggleTheme = useToggleTheme();
const toggleTheme = async () => {
  if (!button.value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    baseToggleTheme();
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
      baseToggleTheme();
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
  <v-tooltip location="bottom" :text="ThemeModeTooltipMap[currentTheme]">
    <template #activator="{ props }">
      <v-avatar color="background">
        <div ref="button">
          <v-btn :icon="ThemeModeIconMap[currentTheme]" :="props" @click="toggleTheme" />
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
