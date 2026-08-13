<script setup lang="ts">
import type { Chest } from "#shared/models/dungeons/data/world/Chest";
import type { Position } from "grid-engine";

import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { Sprite, useAnimations } from "vue-phaserjs";

interface ChestProps {
  chest: Chest;
  position: Position;
}

const { chest, position } = defineProps<ChestProps>();
const startFrame = 18 * 32 + 19;
const endFrame = 18 * 32 + 21;
// Reactivity will be handled by animations
const frame = chest.isOpened ? endFrame : startFrame;
const animations = useAnimations((scene) => [
  {
    delay: 0,
    frameRate: 16,
    frames: scene.anims.generateFrameNumbers(TilesetKey.Dungeon, { end: endFrame, start: startFrame }),
    key: TilesetKey.Dungeon,
    repeat: 0,
  },
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
