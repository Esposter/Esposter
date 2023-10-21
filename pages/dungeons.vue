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
    <transition name="fade" mode="out-in">
      <component :is="stateComponent" />
    </transition>
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
