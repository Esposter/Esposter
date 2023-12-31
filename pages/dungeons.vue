<script setup lang="ts">
import { SURFACE_DARK } from "@/services/vuetify/constants";

defineRouteRules({ ssr: false });

const id = "game-container";
useLaunchGame(id);
</script>

<template>
  <NuxtLayout :main-style="{ backgroundColor: SURFACE_DARK }">
    <div :id />
  </NuxtLayout>
</template>
