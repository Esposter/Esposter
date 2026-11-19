<script setup lang="ts">
import { getPositionId } from "#src/services/dungeons/direction/getPositionId";
import { useTitleSceneStore } from "#src/store/dungeons/title/scene";

const titleSceneStore = useTitleSceneStore();
const { playerTitleMenuOptionGrid } = titleSceneStore;
</script>

<template>
  <template v-for="(row, rowIndex) of unref(playerTitleMenuOptionGrid.grid)" :key="rowIndex">
    <DungeonsTitleMenuContentText
      v-for="(text, columnIndex) of row"
      :key="getPositionId({ x: columnIndex, y: rowIndex })"
      :row-index
      :column-index
      :text
    />
  </template>
</template>
