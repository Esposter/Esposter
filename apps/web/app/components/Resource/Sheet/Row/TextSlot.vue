<script setup lang="ts">
import { useRowStore } from "@/store/resource/sheet/row";

const rowStore = useRowStore();
const { search } = storeToRefs(rowStore);
</script>

<template>
  <div flex gap-2 items-center>
    <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" single-line />
    <ResourceSheetFindReplaceDialogButton />
  </div>
  <ResourceSheetFindReplaceBar />
  <div flex flex-wrap gap-1 items-center>
    <ResourceSheetRowToolsMenuButton />
    <ResourceSheetRowClearFiltersButton />
    <ResourceSheetRowCreateDialogButton />
  </div>
</template>
