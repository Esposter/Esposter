<script setup lang="ts">
defineRouteRules({ ssr: false });

const id = "game-container";
useLaunchGame(id);
</script>

<template>
  <NuxtLayout>
    <!-- @TODO: https://github.com/vuejs/language-tools/issues/3830 -->
    <!-- eslint-disable-next-line vue/valid-v-bind -->
    <div :id />
  </NuxtLayout>
</template>
