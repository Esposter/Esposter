<script setup lang="ts">
import { useRowStore } from "#src/store/resource/sheet/row";
import { useRowDialogStore } from "#src/store/resource/sheet/rowDialog";

const rowStore = useRowStore();
const { selectedRowIds } = storeToRefs(rowStore);
const rowDialogStore = useRowDialogStore();
const { deletingIds } = storeToRefs(rowDialogStore);
</script>

<template>
  <ResourceSheetSelectionToolbar v-model="selectedRowIds" label="row" @delete="(ids) => (deletingIds = ids)" />
</template>
