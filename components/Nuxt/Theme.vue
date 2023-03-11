<script setup lang="ts">
import { ThemeMode } from "@/plugins/vuetify";
import { THEME_COOKIE_NAME } from "@/services/vuetify/constants";

const theme = useGlobalTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME);
theme.name.value = themeCookie.value ?? ThemeMode.light;
</script>

<template>
  <slot />
</template>
