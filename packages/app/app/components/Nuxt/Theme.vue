<script setup lang="ts">
import { ThemeMode } from "@/models/vuetify/ThemeMode";
import { THEME_COOKIE_NAME } from "@/services/vuetify/constants";

defineSlots<{ default: () => VNode }>();

const theme = useTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME, { default: () => ThemeMode.system });
theme.change(themeCookie.value);
</script>

<template>
  <slot />
</template>
