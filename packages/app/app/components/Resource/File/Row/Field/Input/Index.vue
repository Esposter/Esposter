<script setup lang="ts" generic="TColumnType extends Exclude<ColumnType, ColumnType.Computed>">
import type { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import type { ColumnTypeColumnMap } from "@/models/resource/file/column/ColumnTypeColumnMap";
import type { ColumnTypeModelValueMap } from "@/models/resource/file/column/ColumnTypeModelValueMap";

import { FieldInputComponentMap } from "@/services/resource/file/column/FieldInputComponentMap";

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
