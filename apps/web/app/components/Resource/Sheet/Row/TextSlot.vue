<script setup lang="ts">
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { useRowStore } from "@/store/resource/sheet/row";

const rowStore = useRowStore();
const { search } = storeToRefs(rowStore);
</script>

<template>
  <div flex gap-2 items-center>
    <!-- The search takes the width the row has, since finding a row is what the grid is used for most -->
    <div flex-1 min-w-0>
      <UiTextField v-model="search" label="Search rows" :type="UiTextFieldType.Search" />
    </div>
    <ResourceSheetFindReplaceDialogButton />
    <ResourceSheetRowToolsMenuButton />
    <ResourceSheetRowClearFiltersButton />
    <ResourceSheetRowCreateDialogButton />
  </div>
  <ResourceSheetFindReplaceBar />
</template>
