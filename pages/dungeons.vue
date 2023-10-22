<script setup lang="ts">
import { getStateComponent } from "@/services/dungeons/getStateComponent";
import { useGameStore } from "@/store/dungeons/game";

const gameStore = useGameStore();
const { game } = storeToRefs(gameStore);
const { surface } = useColors();
const stateComponent = computed(() => getStateComponent(game.value.state));
</script>

<template>
  <NuxtLayout :main-style="{ backgroundColor: surface }">
    <component :is="stateComponent" />
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
</style>
