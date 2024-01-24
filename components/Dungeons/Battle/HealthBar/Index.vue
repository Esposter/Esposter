<script setup lang="ts">
import { type Position } from "grid-engine";

interface HealthBarProps {
  position: Position;
}

const { position } = defineProps<HealthBarProps>();
const displayWidth = 360;
const scaleY = 0.7;
// const leftCap = ref<{ [GAME_OBJECT_KEY]: GameObjects.Image }>();
// const middle = ref<{ [GAME_OBJECT_KEY]: GameObjects.Image }>();
// const middleX = computed(() => {
//   if (!leftCap.value) return 0;

//   const { x, displayWidth } = leftCap.value[GAME_OBJECT_KEY];
//   return x + displayWidth;
// });
// const rightCapX = computed(() => {
//   if (!middle.value) return 0;

//   const { x, displayWidth } = middle.value[GAME_OBJECT_KEY];
//   return x + displayWidth;
// });
</script>

<template>
  <DungeonsBattleHealthBarLeftCap :position="position" :scale-y="scaleY" />
  <DungeonsBattleHealthBarMiddle :position="{ ...position }" :scale-y="scaleY" :display-width="displayWidth" />
  <DungeonsBattleHealthBarRightCap :position="{ ...position }" :scale-y="scaleY" />
</template>
