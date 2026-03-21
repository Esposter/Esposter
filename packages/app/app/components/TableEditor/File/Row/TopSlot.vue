<script setup lang="ts">
import { useRowStore } from "@/store/tableEditor/file/row";

const rowStore = useRowStore();
const { selectedRowIds } = storeToRefs(rowStore);
const deleteRows = useDeleteRows();
</script>

<template>
  <v-toolbar>
    <v-toolbar-title pl-3>
      {{ selectedRowIds.length }} row{{ selectedRowIds.length === 1 ? "" : "s" }} selected
    </v-toolbar-title>
    <StyledConfirmDeleteDialogButton
      :card-props="{
        title: `Delete ${selectedRowIds.length} Row${selectedRowIds.length === 1 ? '' : 's'}`,
        text: `Are you sure you want to delete ${selectedRowIds.length} selected row${selectedRowIds.length === 1 ? '' : 's'}?`,
      }"
      @delete="
        (onComplete) => {
          deleteRows(selectedRowIds);
          selectedRowIds = [];
          onComplete();
        }
      "
    />
  </v-toolbar>
</template>
