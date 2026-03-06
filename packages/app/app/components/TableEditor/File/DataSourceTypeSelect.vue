<script setup lang="ts">
import { DataSourceTypeItemCategoryDefinitions } from "@/services/tableEditor/file/DataSourceTypeItemCategoryDefinitions";
import { useFileTableEditorStore } from "@/store/tableEditor/file";

const { selectedDataSourceType } = storeToRefs(useFileTableEditorStore());
</script>

<template>
  <v-select
    v-model="selectedDataSourceType"
    :items="DataSourceTypeItemCategoryDefinitions"
    hide-details
    label="Source"
  />
</template>
