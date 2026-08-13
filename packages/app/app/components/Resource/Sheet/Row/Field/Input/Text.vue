<script setup lang="ts">
import type { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";
import type { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { FieldInputTypeMap } from "@/services/resource/sheet/column/FieldInputTypeMap";

interface FieldInputTextProps {
  column: NumberColumn | StringColumn;
  isInline?: true;
}

const { column, isInline } = defineProps<FieldInputTextProps>();
const modelValue = defineModel<null | number | string>({ required: true });
const textValue = computed({
  get: () => (modelValue.value === null ? "" : String(modelValue.value)),
  set: (value) => {
    modelValue.value = column.type === ColumnType.Number ? (value ? Number(value) : null) : value || null;
  },
});
</script>

<template>
  <v-text-field
    v-model="textValue"
    :hide-details="isInline"
    :label="isInline ? '' : column.name"
    :single-line="isInline"
    :type="FieldInputTypeMap[column.type]"
    density="compact"
  />
</template>
