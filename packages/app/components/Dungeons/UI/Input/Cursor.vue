<script setup lang="ts" generic="TValue, TGrid extends readonly (readonly TValue[])[]">
import type { Grid } from "@/models/dungeons/Grid";
import type { Position } from "grid-engine";
import type { ImageConfiguration } from "vue-phaserjs";

import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { Image } from "vue-phaserjs";

interface CursorProps {
  cursorImageKey?: Extract<ImageKey, "CursorWhite">;
  grid: Grid<TValue, TGrid>;
  initialPosition: Position;
  positionIncrement: Partial<Position>;
  scale?: number;
  tween?: ImageConfiguration["tween"];
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
  x: initialPosition.x + (positionIncrement.x ?? 0) * grid.position.value.x,
  y: initialPosition.y + (positionIncrement.y ?? 0) * grid.position.value.y,
}));
</script>

<template>
  <Image :configuration="{ ...position, texture: cursorImageKey, scale, tween }" />
</template>
