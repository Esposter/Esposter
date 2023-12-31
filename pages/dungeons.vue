<script setup lang="ts">
import { SURFACE_DARK } from "@/services/vuetify/constants";

defineRouteRules({ ssr: false });

const id = "game-container";
useLaunchGame(id);
</script>

<template>
  <NuxtLayout :main-style="{ backgroundColor: SURFACE_DARK }">
    <!-- @TODO: https://github.com/vuejs/language-tools/issues/3830 -->
    <!-- eslint-disable-next-line vue/valid-v-bind -->
    <div :id />
  </NuxtLayout>
</template>
