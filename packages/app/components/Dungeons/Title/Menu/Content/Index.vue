<script setup lang="ts">
import { getGridKey } from "@/services/dungeons/getGridKey";
import { PlayerTitleMenuOptionGrid } from "@/services/dungeons/scene/title/menu/PlayerTitleMenuOptionGrid";
</script>

<template>
  <template v-for="(row, rowIndex) of unref(PlayerTitleMenuOptionGrid.grid)" :key="rowIndex">
    <DungeonsTitleMenuContentText
      v-for="(text, columnIndex) of row"
      :key="getGridKey(rowIndex, columnIndex)"
      :row-index
      :column-index
      :text
    />
  </template>
</template>
