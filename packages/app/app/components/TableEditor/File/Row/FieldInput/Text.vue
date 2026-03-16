<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/Column";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { FieldInputTypeMap } from "@/services/tableEditor/file/FieldInputTypeMap";

interface FieldInputTextProps {
  column: Column<ColumnType.Number | ColumnType.String>;
}

const { column } = defineProps<FieldInputTextProps>();
const modelValue = defineModel<null | number | string>({ required: true });
</script>

<template>
  <v-text-field v-model="modelValue" :label="column.name" :type="FieldInputTypeMap[column.type]" density="compact" />
</template>
