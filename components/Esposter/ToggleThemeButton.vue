<script setup lang="ts">
import { THEME_COOKIE_NAME } from "@/util/constants";
import { useTheme } from "vuetify/lib/framework.mjs";

const theme = useTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME);
const toggleTheme = () => {
  const newThemeValue = theme.global.current.value.dark ? "light" : "dark";
  themeCookie.value = theme.global.name.value = newThemeValue;
};
</script>

<template>
  <v-btn
    :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'"
    @click="toggleTheme"
  />
</template>
