<script setup lang="ts" generic="TGrid extends readonly (readonly unknown[])[]">
import type { Grid } from "#src/models/dungeons/Grid";
import type { GridValue } from "#src/models/dungeons/GridValue";

import { getGridKey } from "#src/services/dungeons/getGridKey";
import {
  CURSOR_POSITION_INCREMENT,
  INITIAL_CURSOR_POSITION,
  MENU_HEIGHT,
  MENU_PADDING,
} from "#src/services/dungeons/scene/battle/menu/constants";
import { getPanelTextPosition } from "#src/services/dungeons/scene/battle/menu/getPanelTextPosition";
import { PANEL_BORDER_COLOR, PANEL_FILL_COLOR } from "#src/services/dungeons/UI/constants";
import { Container, Rectangle } from "vue-phaserjs";

interface Props {
  getText: (value: GridValue<TGrid>) => string;
  grid: Grid<TGrid>;
  isVisible: boolean;
  x?: number;
}

const { x = 0 } = defineProps<Props>();
</script>

<template>
  <Container :configuration="{ visible: isVisible, x, y: 448 }">
    <Rectangle
      :configuration="{
        origin: 0,
        width: 500,
        height: MENU_HEIGHT,
        fillColor: PANEL_FILL_COLOR,
        strokeStyle: [MENU_PADDING * 2, PANEL_BORDER_COLOR],
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
