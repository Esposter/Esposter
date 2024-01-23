<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import { GAME_OBJECT_KEY } from "@/lib/phaser/util/constants";
import { type Position } from "grid-engine";
import { type GameObjects } from "phaser";

interface HealthBarShadowProps {
  position: Position;
}

const { position } = defineProps<HealthBarShadowProps>();
const displayWidth = 360;
const scaleY = 0.7;
const leftCapShadow = ref<{ [GAME_OBJECT_KEY]: GameObjects.Image }>();
const middleShadow = ref<{ [GAME_OBJECT_KEY]: GameObjects.Image }>();
const middleShadowX = computed(() => {
  if (!leftCapShadow.value) return 0;

  const { x, displayWidth } = leftCapShadow.value[GAME_OBJECT_KEY];
  return x + displayWidth;
});
const rightShadowX = computed(() => {
  if (!middleShadow.value) return 0;

  const { x, displayWidth } = middleShadow.value[GAME_OBJECT_KEY];
  return x + displayWidth;
});
</script>

<template>
  <Container :configuration="{ ...position }">
    <DungeonsBattleLeftCapShadow ref="leftCapShadow" :position="position" :scale-y="scaleY" />
    <DungeonsBattleMiddleShadow
      ref="middleShadow"
      :position="{ ...position, x: middleShadowX }"
      :scale-y="scaleY"
      :display-width="displayWidth"
    />
    <DungeonsBattleRightCapShadow :position="{ ...position, x: rightShadowX }" :scale-y="scaleY" />
  </Container>
</template>
