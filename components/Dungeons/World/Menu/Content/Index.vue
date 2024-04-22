<script setup lang="ts">
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { getGridKey } from "@/services/dungeons/getGridKey";
import {
  INITIAL_MENU_CURSOR_POSITION,
  MENU_CURSOR_POSITION_INCREMENT,
} from "@/services/dungeons/scene/world/constants";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const worldSceneStore = useWorldSceneStore();
const { menuOptionGrid } = storeToRefs(worldSceneStore);
</script>

<template>
  <template v-for="(row, rowIndex) in menuOptionGrid.grid" :key="rowIndex">
    <DungeonsWorldMenuContentText
      v-for="(text, columnIndex) in row"
      :key="getGridKey(rowIndex, columnIndex)"
      :row-index="rowIndex"
      :column-index="columnIndex"
      :text="text"
    />
  </template>
  <DungeonsUIInputCursor
    :cursor-image-key="ImageKey.CursorWhite"
    :grid="menuOptionGrid"
    :initial-position="INITIAL_MENU_CURSOR_POSITION"
    :position-increment="MENU_CURSOR_POSITION_INCREMENT"
  />
</template>
