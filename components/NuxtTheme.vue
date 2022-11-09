<script setup lang="ts">
import { ThemeMode } from "@/plugins/vuetify";
import { THEME_COOKIE_NAME } from "@/util/constants.client";

const theme = useGlobalTheme();
const themeCookie = $(useCookie(THEME_COOKIE_NAME));
theme.name.value = themeCookie ?? ThemeMode.light;
</script>

<template>
  <slot />
</template>
