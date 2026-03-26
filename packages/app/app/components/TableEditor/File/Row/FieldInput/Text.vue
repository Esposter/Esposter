<script setup lang="ts">
import type { NumberColumn } from "#shared/models/tableEditor/file/column/NumberColumn";
import type { StringColumn } from "#shared/models/tableEditor/file/column/StringColumn";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { FieldInputTypeMap } from "@/services/tableEditor/file/column/FieldInputTypeMap";

interface FieldInputTextProps {
  column: NumberColumn | StringColumn;
  inline?: boolean;
}

const { column, inline = false } = defineProps<FieldInputTextProps>();
const modelValue = defineModel<null | number | string>({ required: true });
const textValue = computed({
  get: () => (modelValue.value === null ? "" : String(modelValue.value)),
  set: (value) => {
    modelValue.value = column.type === ColumnType.Number ? (value === "" ? null : Number(value)) : value || null;
  },
});
</script>

<template>
  <v-text-field
    v-model="textValue"
    :hide-details="inline"
    :label="inline ? '' : column.name"
    :single-line="inline"
    :type="FieldInputTypeMap[column.type]"
    density="compact"
  />
</template>
