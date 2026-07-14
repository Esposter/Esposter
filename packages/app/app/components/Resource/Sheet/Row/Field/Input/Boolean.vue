<script setup lang="ts">
import type { BooleanColumn } from "#shared/models/resource/sheet/column/BooleanColumn";

interface FieldInputBooleanProps {
  column: BooleanColumn;
  isInline?: true;
}

const { column, isInline } = defineProps<FieldInputBooleanProps>();
const modelValue = defineModel<boolean | null>({ required: true });
</script>

<template>
  <v-checkbox v-model="modelValue" :hide-details="isInline" :label="isInline ? '' : column.name" />
</template>
