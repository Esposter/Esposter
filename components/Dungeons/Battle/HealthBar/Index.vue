<script setup lang="ts">
import { GAME_OBJECT_KEY } from "@/lib/phaser/util/constants";
import { type Position } from "grid-engine";
import { type GameObjects } from "phaser";

interface HealthBarProps {
  position: Position;
}

const { position } = defineProps<HealthBarProps>();
const displayWidth = 360;
const scaleY = 0.7;
const leftCap = ref<{ [GAME_OBJECT_KEY]: GameObjects.Image }>();
const middle = ref<{ [GAME_OBJECT_KEY]: GameObjects.Image }>();
const middleX = computed(() => {
  if (!leftCap.value) return 0;

  const { x, displayWidth } = leftCap.value[GAME_OBJECT_KEY];
  return x + displayWidth;
});
const rightCapX = computed(() => {
  if (!middle.value) return 0;

  const { x, displayWidth } = middle.value[GAME_OBJECT_KEY];
  return x + displayWidth;
});
</script>

<template>
  <DungeonsBattleHealthBarLeftCap ref="leftCap" :position="position" :scale-y="scaleY" />
  <DungeonsBattleHealthBarMiddle
    ref="middle"
    :position="{ ...position, x: middleX }"
    :scale-y="scaleY"
    :display-width="displayWidth"
  />
  <DungeonsBattleHealthBarRightCap :position="{ ...position, x: rightCapX }" :scale-y="scaleY" />
</template>
