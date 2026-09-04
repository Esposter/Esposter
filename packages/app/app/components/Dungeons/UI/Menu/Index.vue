<script setup lang="ts" generic="TGrid extends readonly (readonly string[])[]">
import type { Grid } from "@/models/dungeons/Grid";
import type { Position } from "grid-engine";

import { MENU_DEPTH, MENU_WIDTH } from "@/services/dungeons/UI/menu/constants";
import { getMenuHeight } from "@/services/dungeons/UI/menu/getMenuHeight";
import { Container, Rectangle } from "vue-phaserjs";

interface Props {
  grid: Grid<TGrid>;
  position: Position;
}

const menu = defineModel<boolean>("menu", { required: true });
const { grid, position } = defineProps<Props>();
const { border, primary } = useDungeonsColors();
</script>

<template>
  <Container :configuration="{ visible: menu, ...position, depth: MENU_DEPTH }">
    <Rectangle
      :configuration="{
        x: 1,
        width: MENU_WIDTH - 1,
        height: getMenuHeight(grid.rowSize) - 1,
        origin: 0,
        fillColor: primary,
        alpha: 0.9,
        strokeStyle: [8, border],
      }"
      @clickoutside="menu = false"
    />
    <DungeonsUIMenuContent :grid />
  </Container>
</template>
