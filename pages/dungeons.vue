<script setup lang="ts">
const { surface } = useColors();
const containerId = "game-container";
useLaunchGame(containerId);
</script>

<template>
  <NuxtLayout :main-style="{ backgroundColor: surface }">
    <div :id="containerId" />
  </NuxtLayout>
</template>
