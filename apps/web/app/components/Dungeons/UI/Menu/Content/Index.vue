<script setup lang="ts" generic="TGrid extends readonly (readonly string[])[]">
import type { Grid } from "#src/models/dungeons/Grid";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { getPositionId } from "#src/services/dungeons/direction/getPositionId";
import { INITIAL_MENU_CURSOR_POSITION, MENU_CURSOR_POSITION_INCREMENT } from "#src/services/dungeons/UI/menu/constants";

interface Props {
  grid: Grid<TGrid>;
}

defineProps<Props>();
</script>

<template>
  <template v-for="(row, rowIndex) of unref(grid.grid)" :key="rowIndex">
    <DungeonsUIMenuContentText
      v-for="(text, columnIndex) of row"
      :key="getPositionId({ x: columnIndex, y: rowIndex })"
      :grid
      :row-index
      :column-index
      :text
    />
  </template>
  <DungeonsUIInputCursor
    :cursor-file-key="FileKey.UICursorCursorWhite"
    :grid
    :initial-position="INITIAL_MENU_CURSOR_POSITION"
    :position-increment="MENU_CURSOR_POSITION_INCREMENT"
  />
</template>
