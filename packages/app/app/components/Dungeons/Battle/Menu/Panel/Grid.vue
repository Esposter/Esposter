<script setup lang="ts" generic="TValue, TGrid extends readonly (readonly TValue[])[]">
import type { Grid } from "@/models/dungeons/Grid";

import { getGridKey } from "@/services/dungeons/getGridKey";
import {
  CURSOR_POSITION_INCREMENT,
  INITIAL_CURSOR_POSITION,
  MENU_HEIGHT,
  MENU_PADDING,
} from "@/services/dungeons/scene/battle/menu/constants";
import { getPanelTextPosition } from "@/services/dungeons/scene/battle/menu/getPanelTextPosition";
import { Container, Rectangle } from "vue-phaserjs";

interface PanelGridProps {
  getText: (value: TValue) => string;
  grid: Grid<TValue, TGrid>;
  isVisible: boolean;
  x?: number;
}

const { getText, grid, isVisible, x = 0 } = defineProps<PanelGridProps>();
</script>

<template>
  <Container :configuration="{ visible: isVisible, x, y: 448 }">
    <Rectangle
      :configuration="{
        origin: 0,
        width: 500,
        height: MENU_HEIGHT,
        fillColor: 0xede4f3,
        strokeStyle: [MENU_PADDING * 2, 0x905ac2],
      }"
    />
    <template v-for="(row, rowIndex) of unref(grid.grid)" :key="rowIndex">
      <DungeonsBattleMenuPanelText
        v-for="(value, columnIndex) of row"
        :key="getGridKey(rowIndex, columnIndex)"
        :grid
        :grid-position="{ x: columnIndex, y: rowIndex }"
        :position="getPanelTextPosition(rowIndex, columnIndex)"
        :text="getText(value)"
      />
    </template>
    <DungeonsUIInputCursor
      :grid
      :initial-position="INITIAL_CURSOR_POSITION"
      :position-increment="CURSOR_POSITION_INCREMENT"
    />
  </Container>
</template>
