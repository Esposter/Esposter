<script setup lang="ts">
import { ThemeMode } from "@/models/vuetify/ThemeMode";
import { THEME_COOKIE_NAME } from "@/services/vuetify/constants";

defineSlots<{ default: (props: Record<string, never>) => unknown }>();

const theme = useGlobalTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME);
theme.name.value = themeCookie.value ?? ThemeMode.light;
</script>

<template>
  <slot />
</template>
