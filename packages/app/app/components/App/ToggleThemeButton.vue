<script setup lang="ts">
import type { ThemeMode } from "@/models/vuetify/ThemeMode";

import { ThemeModeIconMap } from "@/services/vuetify/ThemeModeIconMap";
import { ThemeModeTooltipMap } from "@/services/vuetify/ThemeModeTooltipMap";

const { global } = useVTheme();
const currentTheme = computed(() => global.name.value as ThemeMode);
const toggleTheme = useToggleTheme();
</script>

<template>
  <v-tooltip location="bottom" :text="ThemeModeTooltipMap[currentTheme]">
    <template #activator="{ props }">
      <v-avatar color="background">
        <!-- The theme's view transition grows from where it was clicked, so this button needs the pointer event
          itself — which StyledTooltipIconButton's click emit narrows to a MouseEvent -->
        <v-btn :icon="ThemeModeIconMap[currentTheme]" :="props" @click="toggleTheme" />
      </v-avatar>
    </template>
  </v-tooltip>
</template>
