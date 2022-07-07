<script setup lang="ts">
import { useTheme } from "vuetify/lib/framework.mjs";

const theme = useTheme();
const toggleTheme = () => (theme.global.name.value = theme.global.current.value.dark ? "light" : "dark");
</script>

<template>
  <v-btn
    :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'"
    @click="toggleTheme"
  />
</template>
