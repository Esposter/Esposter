<script setup lang="ts" generic="TColumnType extends Exclude<ColumnType, ColumnType.Computed>">
import type { ColumnTypeColumnMap } from "@/models/tableEditor/file/ColumnTypeColumnMap";
import type { ColumnTypeModelValueMap } from "@/models/tableEditor/file/ColumnTypeModelValueMap";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { FieldInputComponentMap } from "@/services/tableEditor/file/column/FieldInputComponentMap";

interface FieldInputProps {
  column: ColumnTypeColumnMap[TColumnType];
  inline?: boolean;
}

const { column, inline = false } = defineProps<FieldInputProps>();
const modelValue = defineModel<ColumnTypeModelValueMap[TColumnType]>({ required: true });
</script>

<template>
  <component :is="FieldInputComponentMap[column.type] as Component" v-model="modelValue" :column :inline />
</template>
