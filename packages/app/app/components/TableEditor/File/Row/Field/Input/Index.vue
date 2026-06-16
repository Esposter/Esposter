<script setup lang="ts" generic="TColumnType extends Exclude<ColumnType, ColumnType.Computed>">
import type { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import type { ColumnTypeColumnMap } from "@/models/tableEditor/file/column/ColumnTypeColumnMap";
import type { ColumnTypeModelValueMap } from "@/models/tableEditor/file/column/ColumnTypeModelValueMap";

import { FieldInputComponentMap } from "@/services/tableEditor/file/column/FieldInputComponentMap";

interface FieldInputProps {
  column: ColumnTypeColumnMap[TColumnType];
  isInline?: true;
}

const { column, isInline } = defineProps<FieldInputProps>();
const modelValue = defineModel<ColumnTypeModelValueMap[TColumnType]>({ required: true });
</script>

<template>
  <component :is="FieldInputComponentMap[column.type] as Component" v-model="modelValue" :column :is-inline />
</template>
