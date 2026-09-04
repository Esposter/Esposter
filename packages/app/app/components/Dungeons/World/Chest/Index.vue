<script setup lang="ts">
import type { Chest } from "#shared/models/dungeons/data/world/Chest";
import type { Position } from "grid-engine";

import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { getAnimationConfiguration } from "@/services/dungeons/animation/getAnimationConfiguration";
import { Sprite, useAnimations } from "vue-phaserjs";

interface Props {
  chest: Chest;
  position: Position;
}

const { chest, position } = defineProps<Props>();
const startFrame = 18 * 32 + 19;
const endFrame = 18 * 32 + 21;
// Reactivity will be handled by animations
const frame = chest.isOpened ? endFrame : startFrame;
const animations = useAnimations((scene) => [
  getAnimationConfiguration(scene, TilesetKey.Dungeon, { end: endFrame, start: startFrame }),
]);
const playAnimationKey = ref<TilesetKey>();

watch(
  () => chest.isOpened,
  (newIsOpened) => {
    if (!newIsOpened) return;
    playAnimationKey.value = TilesetKey.Dungeon;
  },
);
</script>

<template>
  <Sprite
    :configuration="{
      ...position,
      origin: 0,
      texture: TilesetKey.Dungeon,
      frame,
      scale: 4,
      animations,
      playAnimationKey,
    }"
  />
</template>
