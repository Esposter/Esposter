<script setup lang="ts">
import { getGridKey } from "#src/services/dungeons/getGridKey";

const itemOptionGrid = useItemOptionGrid();
</script>

<template>
  <template v-for="(row, rowIndex) of unref(itemOptionGrid.grid)" :key="rowIndex">
    <DungeonsInventoryItemListItemContainer
      v-for="(item, columnIndex) of row"
      :key="getGridKey(rowIndex, columnIndex)"
      :row-index
      :column-index
      :item
    />
  </template>
</template>
