<script setup lang="ts" generic="TEnum extends string, TGrid extends ReadonlyArray<ReadonlyArray<TEnum>>">
import type { ImageProps } from "@/lib/phaser/components/Image.vue";
import Image from "@/lib/phaser/components/Image.vue";
import type { Grid } from "@/models/dungeons/Grid";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import type { Position } from "grid-engine";

interface CursorProps {
  grid: Grid<TEnum, TGrid>;
  initialPosition: Position;
  positionIncrement: Partial<Position>;
  tween?: ImageProps["configuration"]["tween"];
}

const { grid, initialPosition, positionIncrement, tween } = defineProps<CursorProps>();
const position = computed(() => ({
  x: initialPosition.x + (positionIncrement.x ?? 0) * grid.position[0],
  y: initialPosition.y + (positionIncrement.y ?? 0) * grid.position[1],
}));
</script>

<template>
  <Image
    :configuration="{
      x: position.x,
      y: position.y,
      textureKey: ImageKey.Cursor,
      origin: 0.5,
      scale: 2.5,
      tween,
    }"
  />
</template>
