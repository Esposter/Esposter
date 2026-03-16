<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/Column";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

interface FieldInputBooleanProps {
  column: Column<ColumnType.Boolean>;
}

const { column } = defineProps<FieldInputBooleanProps>();
const modelValue = defineModel<boolean>({ required: true });
</script>

<template>
  <v-checkbox v-model="modelValue" :label="column.name" />
</template>
