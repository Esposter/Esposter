<script setup lang="ts" generic="TGrid extends readonly (readonly unknown[])[]">
import type { Grid } from "#src/models/dungeons/Grid";
import type { Position } from "grid-engine-headless";
import type { ImageConfiguration } from "vue-phaserjs";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { Image } from "vue-phaserjs";

interface Props {
  cursorFileKey?: typeof DungeonsKeys.UICursorCursor | typeof DungeonsKeys.UICursorCursorWhite | undefined;
  grid: Grid<TGrid>;
  initialPosition: Position;
  positionIncrement: Partial<Position>;
  scale?: number | undefined;
  tween?: ImageConfiguration["tween"] | undefined;
}

const {
  cursorFileKey = DungeonsKeys.UICursorCursor,
  grid,
  initialPosition,
  positionIncrement,
  scale = 2.5,
} = defineProps<Props>();
const position = computed(() => ({
  x: initialPosition.x + (positionIncrement.x ?? 0) * grid.position.value.x,
  y: initialPosition.y + (positionIncrement.y ?? 0) * grid.position.value.y,
}));
</script>

<template>
  <Image :configuration="{ ...position, texture: cursorFileKey, scale, tween }" />
</template>
