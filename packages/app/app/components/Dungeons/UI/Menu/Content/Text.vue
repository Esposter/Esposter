<script setup lang="ts" generic="TValue, TGrid extends readonly (readonly TValue[])[]">
import type { Grid } from "@/models/dungeons/Grid";

import { MenuTextStyle } from "@/assets/dungeons/styles/MenuTextStyle";
import { INITIAL_MENU_CURSOR_POSITION, MENU_CURSOR_POSITION_INCREMENT } from "@/services/dungeons/UI/menu/constants";
import { Input } from "phaser";
import { Text } from "vue-phaserjs";

interface ContentTextProps {
  columnIndex: number;
  grid: Grid<TValue, TGrid>;
  rowIndex: number;
  text: string;
}

const { columnIndex, grid, rowIndex, text } = defineProps<ContentTextProps>();
const onGridClick = useOnGridClick(grid, () => ({ x: columnIndex, y: rowIndex }));
</script>

<template>
  <Text
    :configuration="{
      x: INITIAL_MENU_CURSOR_POSITION.x + MENU_CURSOR_POSITION_INCREMENT.x * columnIndex + 20,
      y: INITIAL_MENU_CURSOR_POSITION.y + MENU_CURSOR_POSITION_INCREMENT.y * rowIndex - 18,
      text,
      style: MenuTextStyle,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
  />
</template>
