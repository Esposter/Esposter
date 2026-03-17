<script setup lang="ts" generic="TColumnType extends ColumnType">
import type { ColumnTypeColumnMap } from "@/models/tableEditor/file/ColumnTypeColumnMap";
import type { ColumnTypeModelValueMap } from "@/models/tableEditor/file/ColumnTypeModelValueMap";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { FieldInputComponentMap } from "@/services/tableEditor/file/column/FieldInputComponentMap";

interface FieldInputProps {
  column: ColumnTypeColumnMap[TColumnType];
}

const { column } = defineProps<FieldInputProps>();
const modelValue = defineModel<ColumnTypeModelValueMap[TColumnType]>({ required: true });
</script>

<template>
  <component :is="FieldInputComponentMap[column.type] as Component" v-model="modelValue" :column />
</template>
