<script setup lang="ts">
import type { ThemeMode } from "@/models/vuetify/ThemeMode";

import { ThemeModeIconMap } from "@/services/vuetify/ThemeModeIconMap";
import { ThemeModeTooltipMap } from "@/services/vuetify/ThemeModeTooltipMap";
import { animateThemeTransition } from "@/util/vuetify/animateThemeTransition";

const globalTheme = useGlobalTheme();
const currentTheme = computed(() => globalTheme.name.value as ThemeMode);
const button = useTemplateRef("button");
const toggleTheme = useToggleTheme();
</script>

<template>
  <v-tooltip location="bottom" :text="ThemeModeTooltipMap[currentTheme]">
    <template #activator="{ props }">
      <v-avatar color="background">
        <div ref="button">
          <v-btn
            :icon="ThemeModeIconMap[currentTheme]"
            :="props"
            @click="animateThemeTransition(button, toggleTheme)"
          />
        </div>
      </v-avatar>
    </template>
  </v-tooltip>
</template>
