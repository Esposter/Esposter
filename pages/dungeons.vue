<script setup lang="ts">
const containerId = "game-container";
useLaunchGame(containerId);
</script>

<template>
  <NuxtLayout :main-style="{ backgroundColor: '#36393f' }">
    <div :id="containerId" />
  </NuxtLayout>
</template>
