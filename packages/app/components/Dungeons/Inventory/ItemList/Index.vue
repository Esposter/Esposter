<script setup lang="ts">
import { getGridKey } from "@/services/dungeons/getGridKey";

const itemOptionGrid = useItemOptionGrid();
</script>

<template>
  <template v-for="(row, rowIndex) in unref(itemOptionGrid.grid)" :key="rowIndex">
    <DungeonsInventoryItemListItemContainer
      v-for="(item, columnIndex) in row"
      :key="getGridKey(rowIndex, columnIndex)"
      :row-index="rowIndex"
      :column-index="columnIndex"
      :item="item"
    />
  </template>
</template>
