<script setup lang="ts" generic="TValue, TGrid extends readonly (readonly TValue[])[]">
import type { Grid } from "@/models/dungeons/Grid";

import { MenuTextStyle } from "@/assets/dungeons/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { INITIAL_MENU_CURSOR_POSITION, MENU_CURSOR_POSITION_INCREMENT } from "@/services/dungeons/UI/menu/constants";
import { Input } from "phaser";

interface ContentTextProps {
  columnIndex: number;
  rowIndex: number;
  text: string;
}

const { columnIndex, rowIndex, text } = defineProps<ContentTextProps>();
const grid = defineModel<Grid<TValue, TGrid>>("grid", { required: true });
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
