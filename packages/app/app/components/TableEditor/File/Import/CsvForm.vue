<script setup lang="ts">
import type { CsvOptions } from "#shared/models/tableEditor/file/CsvOptions";

import { CsvDelimiterItemCategoryDefinitions } from "@/services/tableEditor/file/CsvDelimiterItemCategoryDefinitions";

const modelValue = defineModel<CsvOptions>({ required: true });
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
