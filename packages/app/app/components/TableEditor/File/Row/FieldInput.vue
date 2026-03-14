<script setup lang="ts">
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { dayjs } from "#shared/services/dayjs";

interface RowFieldInputProps {
  column: DataSource["columns"][number];
}

const { column } = defineProps<RowFieldInputProps>();
const modelValue = defineModel<ColumnValue>({ required: true });
const dateFormat = computed(() => (column.type === ColumnType.Date ? (column).format : ""));
const textFieldType = computed(() => {
  if (column.type === ColumnType.Number) return "number";
  if (column.type === ColumnType.Date) return "date";
  return "text";
});
const textFieldValue = computed(() => {
  if (column.type !== ColumnType.Date || typeof modelValue.value !== "string") return modelValue.value;
  const date = dayjs(modelValue.value, dateFormat.value, true);
  if (date.isValid()) return date.format("YYYY-MM-DD");
  return modelValue.value;
});
</script>

<template>
  <v-checkbox
    v-if="column.type === ColumnType.Boolean"
    :model-value="Boolean(modelValue)"
    :label="column.name"
    @update:model-value="modelValue = $event"
  />
  <v-text-field
    v-else
    :model-value="textFieldValue"
    :label="column.name"
    :type="textFieldType"
    density="compact"
    @update:model-value="
      modelValue =
        column.type === ColumnType.Date ? ($event ? dayjs($event, 'YYYY-MM-DD').format(dateFormat) : $event) : $event
    "
  />
</template>
