<script setup lang="ts">
import { DataSourceTypeItemCategoryDefinitions } from "@/services/tableEditor/file/DataSourceTypeItemCategoryDefinitions";
import { useFileTableEditorStore } from "@/store/tableEditor/file";

const store = useFileTableEditorStore();
const { selectedDataSourceType } = storeToRefs(store);
</script>

<template>
  <v-select
    v-model="selectedDataSourceType"
    :items="DataSourceTypeItemCategoryDefinitions"
    hide-details
    label="Source"
  />
</template>
