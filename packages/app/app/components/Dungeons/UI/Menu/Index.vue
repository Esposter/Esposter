<script setup lang="ts" generic="TValue extends string, TGrid extends readonly (readonly TValue[])[]">
import type { Grid } from "@/models/dungeons/Grid";
import type { Position } from "grid-engine";

import { MENU_DEPTH, MENU_WIDTH } from "@/services/dungeons/UI/menu/constants";
import { getMenuHeight } from "@/services/dungeons/UI/menu/getMenuHeight";
import { Container, Rectangle } from "vue-phaserjs";

interface MenuProps {
  grid: Grid<TValue, TGrid>;
  position: Position;
}

const { grid, position } = defineProps<MenuProps>();
const menu = defineModel<boolean>("menu", { required: true });
const { border, primary } = useDungeonsColors();
const menuHeight = computed(() => getMenuHeight(grid.rowSize));
</script>

<template>
  <Container :configuration="{ visible: menu, ...position, depth: MENU_DEPTH, scrollFactor: 0 }">
    <Rectangle
      :configuration="{
        x: 1,
        width: MENU_WIDTH - 1,
        height: menuHeight - 1,
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
