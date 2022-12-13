<script setup lang="ts">
import { THEME_COOKIE_NAME } from "@/util/constants.client";

const theme = useGlobalTheme();
let themeCookie = $(useCookie(THEME_COOKIE_NAME));
const toggleTheme = () => {
  const newThemeValue = theme.current.value.dark ? "light" : "dark";
  themeCookie = theme.name.value = newThemeValue;
};
</script>

<template>
  <v-tooltip location="bottom" text="Dark Mode">
    <template #activator="{ props }">
      <v-avatar color="background">
        <v-btn
          :icon="theme.current.value.dark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'"
          color="transparent"
          :="props"
          @click="toggleTheme"
        />
      </v-avatar>
    </template>
  </v-tooltip>
</template>
