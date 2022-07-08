<script setup lang="ts">
import { THEME_COOKIE_NAME } from "@/util/constants";
import { useTheme } from "vuetify/lib/framework.mjs";

const theme = useTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME);
theme.global.name.value = themeCookie.value;
</script>

<template>
  <slot />
</template>
