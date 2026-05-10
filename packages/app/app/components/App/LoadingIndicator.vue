<script setup lang="ts">
import { useColorsStore } from "@/store/colors";

const colorsStore = useColorsStore();
const { "primary-lighten-1": primaryLighten1 } = storeToRefs(colorsStore);
</script>

<template>
  <NuxtLoadingIndicator
    :height="2"
    :color="primaryLighten1?.toString()"
    !top="[var(--app-bar-height)]"
    shadow="[0_0_5px_rgb(var(--v-theme-primary-lighten-1))]"
    !z="[1500]"
  />
</template>
