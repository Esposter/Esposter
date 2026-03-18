<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/Column";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { FieldInputTypeMap } from "@/services/tableEditor/file/column/FieldInputTypeMap";

interface FieldInputTextProps {
  column: Column<ColumnType.Number | ColumnType.String>;
}

const { column } = defineProps<FieldInputTextProps>();
const modelValue = defineModel<null | number | string>({ required: true });
const textValue = computed({
  get: () => (modelValue.value === null ? "" : String(modelValue.value)),
  set: (value) => {
    modelValue.value = column.type === ColumnType.Number ? (value === "" ? null : Number(value)) : value || null;
  },
});
</script>

<template>
  <v-text-field v-model="textValue" :label="column.name" :type="FieldInputTypeMap[column.type]" density="compact" />
</template>
