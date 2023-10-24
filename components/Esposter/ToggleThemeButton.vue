<script setup lang="ts">
import { phaserEventEmitter } from "@/models/dungeons/events/phaser";
import { THEME_COOKIE_NAME } from "@/services/vuetify/constants";

const theme = useGlobalTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME);
const { surface } = useColors();
const toggleTheme = () => {
  const newThemeValue = theme.current.value.dark ? "light" : "dark";
  themeCookie.value = theme.name.value = newThemeValue;
  phaserEventEmitter.emit("onUpdateBackgroundColor", surface.value);
};
</script>

<template>
  <v-tooltip location="bottom" text="Dark Mode">
    <template #activator="{ props }">
      <v-avatar color="background">
        <v-btn
          :icon="theme.current.value.dark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'"
          :="props"
          @click="toggleTheme"
        />
      </v-avatar>
    </template>
  </v-tooltip>
</template>
