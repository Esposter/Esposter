<script setup lang="ts" generic="TValue, TGrid extends ReadonlyArray<ReadonlyArray<TValue>>">
import type { ImageProps } from "@/lib/phaser/components/Image.vue";
import Image from "@/lib/phaser/components/Image.vue";
import type { Grid } from "@/models/dungeons/Grid";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import type { Position } from "grid-engine";

interface CursorProps {
  cursorImageKey?: Extract<ImageKey, "CursorWhite">;
  grid: Grid<TValue, TGrid>;
  initialPosition: Position;
  positionIncrement: Partial<Position>;
  tween?: ImageProps["configuration"]["tween"];
}

const {
  cursorImageKey = ImageKey.Cursor,
  grid,
  initialPosition,
  positionIncrement,
  tween,
} = defineProps<CursorProps>();
const position = computed(() => ({
  x: initialPosition.x + (positionIncrement.x ?? 0) * grid.position.x,
  y: initialPosition.y + (positionIncrement.y ?? 0) * grid.position.y,
}));
</script>

<template>
  <Image
    :configuration="{
      x: position.x,
      y: position.y,
      textureKey: cursorImageKey,
      scale: 2.5,
      tween,
    }"
  />
</template>
