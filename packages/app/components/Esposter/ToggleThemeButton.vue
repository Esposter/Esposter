<script setup lang="ts">
import { ThemeMode } from "@/models/vuetify/ThemeMode";
import { THEME_COOKIE_NAME } from "@/services/vuetify/constants";

const theme = useGlobalTheme();
const isDark = useIsDark();
const themeCookie = useCookie(THEME_COOKIE_NAME);
const toggleTheme = () => {
  const newThemeValue = isDark.value ? ThemeMode.light : ThemeMode.dark;
  themeCookie.value = theme.name.value = newThemeValue;
};
</script>

<template>
  <v-tooltip location="bottom" text="Dark Mode">
    <template #activator="{ props }">
      <v-avatar color="background">
        <v-btn :icon="isDark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'" :="props" @click="toggleTheme" />
      </v-avatar>
    </template>
  </v-tooltip>
</template>
