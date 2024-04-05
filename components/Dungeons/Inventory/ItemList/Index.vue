<script setup lang="ts">
import { getGridKey } from "@/services/dungeons/getGridKey";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";

const inventorySceneStore = useInventorySceneStore();
const { itemOptionGrid } = storeToRefs(inventorySceneStore);
</script>

<template>
  <template v-for="(row, rowIndex) in itemOptionGrid.grid" :key="rowIndex">
    <DungeonsInventoryItemListItem
      v-for="(item, columnIndex) in row"
      :key="getGridKey(rowIndex, columnIndex)"
      :row-index="rowIndex"
      :column-index="columnIndex"
      :item="item"
    />
  </template>
</template>
