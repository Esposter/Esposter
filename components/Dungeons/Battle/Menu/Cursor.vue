<script setup lang="ts" generic="T extends string">
import Image from "@/lib/phaser/components/Image.vue";
import { type Grid } from "@/models/dungeons/Grid";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { type Position } from "grid-engine";

interface CursorProps {
  grid: Grid<T>;
  positionMap: Position[][];
}

const { grid, positionMap } = defineProps<CursorProps>();
const position = computed(() => positionMap[grid.position[1]][grid.position[0]]);
</script>

<template>
  <Image
    :configuration="{
      x: position.x,
      y: position.y,
      textureKey: ImageKey.Cursor,
      origin: 0.5,
      scale: 2.5,
    }"
  />
</template>
