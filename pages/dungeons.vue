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

<style scoped lang="scss">
@import "@/assets/dungeons/styles/variables.scss";

:deep(.header) {
  font-family: $header-font;
}

:deep(.paragraph) {
  font-family: $paragraph-font;
}

#game-container {
  height: calc(100dvh - $app-bar-height);
  width: 100%;
}
</style>
