<script setup lang="ts">
import { THEME_COOKIE_NAME } from "@/util/constants";

const theme = useGlobalTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME);
theme.name.value = themeCookie.value;
</script>

<template>
  <slot />
</template>
