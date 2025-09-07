<script setup lang="ts" generic="TValue extends string, TGrid extends readonly (readonly TValue[])[]">
import type { Grid } from "@/models/dungeons/Grid";

import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { getGridKey } from "@/services/dungeons/getGridKey";
import { INITIAL_MENU_CURSOR_POSITION, MENU_CURSOR_POSITION_INCREMENT } from "@/services/dungeons/UI/menu/constants";

interface ContentProps {
  grid: Grid<TValue, TGrid>;
}

const { grid } = defineProps<ContentProps>();
</script>

<template>
  <template v-for="(row, rowIndex) of unref(grid.grid)" :key="rowIndex">
    <DungeonsUIMenuContentText
      v-for="(text, columnIndex) of row"
      :key="getGridKey(rowIndex, columnIndex)"
      :grid
      :row-index
      :column-index
      :text
    />
  </template>
  <DungeonsUIInputCursor
    :cursor-image-key="ImageKey.CursorWhite"
    :grid
    :initial-position="INITIAL_MENU_CURSOR_POSITION"
    :position-increment="MENU_CURSOR_POSITION_INCREMENT"
  />
</template>
