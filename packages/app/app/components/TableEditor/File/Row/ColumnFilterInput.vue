<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { BooleanFilterValue } from "@/models/tableEditor/file/column/BooleanFilterValue";
import type { ColumnFilter } from "@/models/tableEditor/file/column/ColumnFilter";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { BooleanFilterValueItemCategoryDefinitions } from "@/services/tableEditor/file/column/BooleanFilterValueItemCategoryDefinitions";

interface ColumnFilterInputProps {
  column: DataSource["columns"][number];
}

const { column } = defineProps<ColumnFilterInputProps>();
const modelValue = defineModel<ColumnFilter | undefined>({ required: true });
const booleanValue = computed<BooleanFilterValue>({
  get: () => (modelValue.value?.type === ColumnType.Boolean ? modelValue.value.value : ""),
  set: (value) => {
    modelValue.value = value ? { type: ColumnType.Boolean, value } : undefined;
  },
});
const minimumValue = computed({
  get: () => (modelValue.value?.type === ColumnType.Number ? modelValue.value.minimum : ""),
  set: (minimum) => {
    const maximum = modelValue.value?.type === ColumnType.Number ? modelValue.value.maximum : "";
    modelValue.value = minimum !== "" || maximum !== "" ? { maximum, minimum, type: ColumnType.Number } : undefined;
  },
});
const maximumValue = computed({
  get: () => (modelValue.value?.type === ColumnType.Number ? modelValue.value.maximum : ""),
  set: (maximum) => {
    const minimum = modelValue.value?.type === ColumnType.Number ? modelValue.value.minimum : "";
    modelValue.value = minimum !== "" || maximum !== "" ? { maximum, minimum, type: ColumnType.Number } : undefined;
  },
});
const stringValue = computed({
  get: () => {
    if (modelValue.value?.type === ColumnType.Date || modelValue.value?.type === ColumnType.String)
      return modelValue.value.value;
    return "";
  },
  set: (value) => {
    if (column.type !== ColumnType.Boolean && column.type !== ColumnType.Computed && column.type !== ColumnType.Number)
      modelValue.value = value ? { type: column.type, value } : undefined;
  },
});
</script>

<template>
  <v-select
    v-if="column.type === ColumnType.Boolean"
    v-model="booleanValue"
    :items="BooleanFilterValueItemCategoryDefinitions"
    density="compact"
    hide-details
    variant="underlined"
  />
  <div v-else-if="column.type === ColumnType.Number" flex gap-1>
    <v-text-field
      v-model="minimumValue"
      density="compact"
      hide-details
      placeholder="Min"
      type="number"
      variant="underlined"
    />
    <v-text-field
      v-model="maximumValue"
      density="compact"
      hide-details
      placeholder="Max"
      type="number"
      variant="underlined"
    />
  </div>
  <v-text-field
    v-else
    v-model="stringValue"
    clearable
    density="compact"
    hide-details
    placeholder="Filter..."
    variant="underlined"
  />
</template>
