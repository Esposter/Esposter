<script setup lang="ts">
import Sprite from "@/lib/phaser/components/Sprite.vue";
import { useAnimations } from "@/lib/phaser/composables/useAnimations";
import type { Chest } from "@/models/dungeons/data/world/Chest";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import type { Position } from "grid-engine";

interface ChestProps {
  position: Position;
  chest: Chest;
}

const { position, chest } = defineProps<ChestProps>();
const startFrame = 18 * 32 + 19;
const endFrame = 18 * 32 + 21;
// Reactivity will be handled by animations
const frame = chest.isOpened ? endFrame : startFrame;
const animations = useAnimations((scene) => [
  {
    key: TilesetKey.Dungeon,
    frames: scene.anims.generateFrameNumbers(TilesetKey.Dungeon, { start: startFrame, end: endFrame }),
    frameRate: 16,
    repeat: 0,
    delay: 0,
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
