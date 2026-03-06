<script setup lang="ts">
import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/CsvDataSourceItem";

import { CsvDelimiterItemCategoryDefinitions } from "@/services/tableEditor/file/CsvDelimiterItemCategoryDefinitions";

const modelValue = defineModel<CsvDataSourceItem>({ required: true });

defineExpose({ accept: ".csv" });
</script>

<template>
  <v-select
    v-model="modelValue.delimiter"
    :items="CsvDelimiterItemCategoryDefinitions"
    density="compact"
    hide-details
    label="Delimiter"
  />
</template>
