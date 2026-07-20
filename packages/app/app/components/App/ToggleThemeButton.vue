<script setup lang="ts">
import type { ThemeMode } from "@/models/vuetify/ThemeMode";

import { ThemeModeIconMap } from "@/services/vuetify/ThemeModeIconMap";
import { ThemeModeTooltipMap } from "@/services/vuetify/ThemeModeTooltipMap";

const globalTheme = useGlobalTheme();
const currentTheme = computed(() => globalTheme.name.value as ThemeMode);
const toggleTheme = useToggleTheme();
</script>

<template>
  <v-tooltip location="bottom" :text="ThemeModeTooltipMap[currentTheme]">
    <template #activator="{ props }">
      <v-avatar color="background">
        <v-btn :icon="ThemeModeIconMap[currentTheme]" :="props" @click="toggleTheme" />
      </v-avatar>
    </template>
  </v-tooltip>
</template>
