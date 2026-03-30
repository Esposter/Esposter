<script setup lang="ts">
import type { BooleanColumn } from "#shared/models/tableEditor/file/column/BooleanColumn";

interface FieldInputBooleanProps {
  column: BooleanColumn;
  inline?: boolean;
}

const { column, inline = false } = defineProps<FieldInputBooleanProps>();
const modelValue = defineModel<boolean | null>({ required: true });
</script>

<template>
  <v-checkbox v-model="modelValue" :hide-details="inline" :label="inline ? '' : column.name" />
</template>
