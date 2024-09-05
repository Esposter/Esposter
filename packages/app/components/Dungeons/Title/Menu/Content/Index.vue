<script setup lang="ts">
import { getGridKey } from "@/services/dungeons/getGridKey";
import { PlayerTitleMenuOptionGrid } from "@/services/dungeons/scene/title/menu/PlayerTitleMenuOptionGrid";
</script>

<template>
  <template v-for="(row, rowIndex) in unref(PlayerTitleMenuOptionGrid.grid)" :key="rowIndex">
    <DungeonsTitleMenuContentText
      v-for="(text, columnIndex) in row"
      :key="getGridKey(rowIndex, columnIndex)"
      :row-index="rowIndex"
      :column-index="columnIndex"
      :text="text"
    />
  </template>
</template>
