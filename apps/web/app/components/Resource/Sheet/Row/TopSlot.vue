<script setup lang="ts">
import { useRowStore } from "@/store/resource/sheet/row";

const rowStore = useRowStore();
const { selectedRowIds } = storeToRefs(rowStore);
const deleteRows = useDeleteRows();
</script>

<template>
  <ResourceSheetSelectionToolbar v-model="selectedRowIds" label="row" @delete="deleteRows" />
</template>
