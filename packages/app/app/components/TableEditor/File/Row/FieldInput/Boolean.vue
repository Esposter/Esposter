<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/Column";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

interface FieldInputBooleanProps {
  column: Column<ColumnType.Boolean>;
  inline?: boolean;
}

const { column, inline = false } = defineProps<FieldInputBooleanProps>();
const modelValue = defineModel<boolean | null>({ required: true });
</script>

<template>
  <v-checkbox v-model="modelValue" :hide-details="inline" :label="inline ? '' : column.name" />
</template>
