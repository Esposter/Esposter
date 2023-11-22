<script setup lang="ts">
import { SURFACE_DARK } from "@/services/vuetify/constants";

defineRouteRules({ ssr: false });

const containerId = "game-container";
useLaunchGame(containerId);
</script>

<template>
  <NuxtLayout :main-style="{ backgroundColor: SURFACE_DARK }">
    <div :id="containerId" />
  </NuxtLayout>
</template>
