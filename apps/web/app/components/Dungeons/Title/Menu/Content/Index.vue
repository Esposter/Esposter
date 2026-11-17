<script setup lang="ts">
import { getGridKey } from "#src/services/dungeons/getGridKey";
import { useTitleSceneStore } from "#src/store/dungeons/title/scene";

const titleSceneStore = useTitleSceneStore();
const { playerTitleMenuOptionGrid } = titleSceneStore;
</script>

<template>
  <template v-for="(row, rowIndex) of unref(playerTitleMenuOptionGrid.grid)" :key="rowIndex">
    <DungeonsTitleMenuContentText
      v-for="(text, columnIndex) of row"
      :key="getGridKey(rowIndex, columnIndex)"
      :row-index
      :column-index
      :text
    />
  </template>
</template>
