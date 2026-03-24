<script setup lang="ts">
import { useColumnStore } from "@/store/tableEditor/file/column";

const columnStore = useColumnStore();
const { selectedColumnIds } = storeToRefs(columnStore);
const deleteColumns = useDeleteColumns();
</script>

<template>
  <v-toolbar>
    <v-toolbar-title pl-3>
      {{ selectedColumnIds.length }} column{{ selectedColumnIds.length === 1 ? "" : "s" }} selected
    </v-toolbar-title>
    <StyledConfirmDeleteDialogButton
      :card-props="{
        title: `Delete ${selectedColumnIds.length} Column${selectedColumnIds.length === 1 ? '' : 's'}`,
        text: `Are you sure you want to delete ${selectedColumnIds.length} selected column${selectedColumnIds.length === 1 ? '' : 's'}?`,
      }"
      @delete="
        (onComplete) => {
          deleteColumns(selectedColumnIds);
          selectedColumnIds = [];
          onComplete();
        }
      "
    />
  </v-toolbar>
</template>
