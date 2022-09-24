<script setup lang="ts">
import { useTheme } from "vuetify/lib/framework.mjs";
import { THEME_COOKIE_NAME } from "@/util/constants";

const theme = useTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME);
theme.global.name.value = themeCookie.value;
</script>

<template>
  <slot />
</template>
