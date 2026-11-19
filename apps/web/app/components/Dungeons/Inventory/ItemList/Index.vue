<script setup lang="ts">
import { getPositionId } from "#src/services/dungeons/direction/getPositionId";
import { useInventorySceneStore } from "#src/store/dungeons/inventory/scene";

const inventorySceneStore = useInventorySceneStore();
const { itemOptionGrid } = inventorySceneStore;
</script>

<template>
  <template v-for="(row, rowIndex) of unref(itemOptionGrid.grid)" :key="rowIndex">
    <DungeonsInventoryItemListItemContainer
      v-for="(item, columnIndex) of row"
      :key="getPositionId({ x: columnIndex, y: rowIndex })"
      :row-index
      :column-index
      :item
    />
  </template>
</template>
