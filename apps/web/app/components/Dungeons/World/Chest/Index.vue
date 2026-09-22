<script setup lang="ts">
import type { Chest } from "#shared/models/dungeons/data/world/Chest";
import type { Position } from "grid-engine";

import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { getAnimationConfiguration } from "@/services/dungeons/animation/getAnimationConfiguration";
import { CHEST_CLOSED_FRAME, CHEST_OPENED_FRAME } from "@/services/dungeons/chest/constants";
import { Sprite, useAnimations } from "vue-phaserjs";

interface Props {
  chest: Chest;
  position: Position;
}

const { chest, position } = defineProps<Props>();
// Reactivity will be handled by animations
const frame = chest.isOpened ? CHEST_OPENED_FRAME : CHEST_CLOSED_FRAME;
const animations = useAnimations((scene) => [
  getAnimationConfiguration(scene, TilesetKey.Dungeon, { end: CHEST_OPENED_FRAME, start: CHEST_CLOSED_FRAME }),
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
