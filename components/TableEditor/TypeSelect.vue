<script setup lang="ts">
import { tableEditorItemCategoryDefinitions } from "@/services/tableEditor/itemCategoryDefinition";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore()();
const { tableEditorType } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-select v-model="tableEditorType" :items="tableEditorItemCategoryDefinitions" hide-details />
</template>
