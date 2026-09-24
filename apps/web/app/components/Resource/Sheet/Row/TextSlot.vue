<script setup lang="ts">
import { useRowStore } from "@/store/resource/sheet/row";

const rowStore = useRowStore();
const { search } = storeToRefs(rowStore);
</script>

<template>
  <div flex flex-wrap gap-2 items-end>
    <!-- The search takes the width the row has, since finding a row is what the grid is used for most -->
    <div flex-1 min-w-48>
      <UiTextField v-model="search" label="Search rows" />
    </div>
    <ResourceSheetFindReplaceDialogButton />
    <ResourceSheetRowToolsMenuButton />
    <ResourceSheetRowClearFiltersButton />
    <ResourceSheetRowCreateDialogButton />
  </div>
  <ResourceSheetFindReplaceBar />
</template>
