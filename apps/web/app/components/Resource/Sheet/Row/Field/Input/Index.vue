<script setup lang="ts" generic="TColumnType extends Exclude<ColumnType, ColumnType.Computed>">
import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import type { ColumnTypeColumnMap } from "@/models/resource/sheet/column/ColumnTypeColumnMap";
import type { ColumnTypeModelValueMap } from "@/models/resource/sheet/column/ColumnTypeModelValueMap";

import { FieldInputComponentMap } from "@/services/resource/sheet/column/FieldInputComponentMap";

interface Props {
  column: ColumnTypeColumnMap[TColumnType];
  isInline?: true;
}

const modelValue = defineModel<ColumnTypeModelValueMap[TColumnType]>({ required: true });
defineProps<Props>();
</script>

<template>
  <component :is="FieldInputComponentMap[column.type] as Component" v-model="modelValue" :column :is-inline />
</template>
