<script setup lang="ts" generic="TValue, TGrid extends readonly (readonly TValue[])[]">
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
  scale?: number;
  tween?: ImageProps["configuration"]["tween"];
}

const {
  cursorImageKey = ImageKey.Cursor,
  grid,
  initialPosition,
  positionIncrement,
  scale = 2.5,
  tween,
} = defineProps<CursorProps>();
const position = computed(() => ({
  x: initialPosition.x + (positionIncrement.x ?? 0) * grid.position.x,
  y: initialPosition.y + (positionIncrement.y ?? 0) * grid.position.y,
}));
</script>

<template>
  <Image :configuration="{ ...position, texture: cursorImageKey, scale, tween }" />
</template>
