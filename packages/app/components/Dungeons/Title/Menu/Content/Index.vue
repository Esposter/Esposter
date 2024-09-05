<script setup lang="ts">
import { getGridKey } from "@/services/dungeons/getGridKey";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";

const titleSceneStore = useTitleSceneStore();
const { optionGrid } = storeToRefs(titleSceneStore);
</script>

<template>
  <template v-for="(row, rowIndex) in optionGrid.grid" :key="rowIndex">
    <DungeonsTitleMenuContentText
      v-for="(text, columnIndex) in row"
      :key="getGridKey(rowIndex, columnIndex)"
      :row-index="rowIndex"
      :column-index="columnIndex"
      :text="text"
    />
  </template>
</template>
