<script setup lang="ts">
import { ThemeMode } from "@/plugins/vuetify";

const theme = useGlobalTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME);
theme.name.value = themeCookie.value ?? ThemeMode.light;
</script>

<template>
  <slot />
</template>
