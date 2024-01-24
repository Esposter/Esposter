<script setup lang="ts">
import { refGameObject } from "@/lib/phaser/util/refGameObject";
import { type Position } from "grid-engine";
import { type GameObjects } from "phaser";

interface ShadowProps {
  position: Position;
}

const { position } = defineProps<ShadowProps>();
const displayWidth = 360;
const scaleY = 0.7;
const leftCapShadow = refGameObject<GameObjects.Image>();
const middleShadow = refGameObject<GameObjects.Image>();
const middleShadowX = computed(() => {
  if (!leftCapShadow.value) return 0;

  const { x, displayWidth } = leftCapShadow.value;
  return x + displayWidth;
});
const rightCapShadowX = computed(() => {
  if (!middleShadow.value) return 0;

  const { x, displayWidth } = middleShadow.value;
  return x + displayWidth;
});
</script>

<template>
  <DungeonsBattleHealthBarLeftCapShadow ref="leftCapShadow" :position="position" :scale-y="scaleY" />
  <DungeonsBattleHealthBarMiddleShadow
    ref="middleShadow"
    :position="{ ...position, x: middleShadowX }"
    :scale-y="scaleY"
    :display-width="displayWidth"
  />
  <DungeonsBattleHealthBarRightCapShadow :position="{ ...position, x: rightCapShadowX }" :scale-y="scaleY" />
</template>
